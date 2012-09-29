import abc
from celery.task import control
from datetime import datetime
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.timezone import now, get_default_timezone
from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib.auth.models import User
from registration.signals import user_activated
from taggit.managers import TaggableManager
from todo_lists.tasks import send_todo_alert


PRIORITIES = (
    (1, _("Low")),
    (2, _("Normal")),
    (3, _("High")),
)


def user_to_dict(user):
    return {
        "id": user.pk,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }


class UserResourceMeta(abc.ABCMeta, models.Model.__metaclass__):
    pass


class UserResource(models.Model):
    owner = models.ForeignKey(User, related_name="owned_%(class)ss")

    __metaclass__ = UserResourceMeta

    @abc.abstractproperty
    def dict_repr(self):
        return {}

    class Meta:
        abstract = True


class ToDoList(UserResource):
    name = models.CharField(max_length=50)

    def __unicode__(self):
        return self.name

    @property
    def dict_repr(self):
        return {
            "id": self.id,
            "name": self.name,
            "overdue_todos_no": self.no_of_overdue_todos,
        }

    @property
    def no_of_overdue_todos(self):
        return self.todos.filter(due_time__lte=now()).count()


class ToDoContext(UserResource):
    name = models.CharField(max_length=50)

    def __unicode__(self):
        return self.name

    @property
    def dict_repr(self):
        return {
            "id": self.id,
            "name": self.name,
        }

class ToDo(UserResource):
    name = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    creation_time = models.DateTimeField(auto_now_add=True)
    last_update_time = models.DateTimeField(auto_now=True, auto_now_add=True)
    due_time = models.DateTimeField(null=True, blank=True)
    completion_time = models.DateTimeField(null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITIES, default=2, null=True, blank=True)
    todo_list = models.ForeignKey(ToDoList, related_name="todos")
    todo_context = models.ForeignKey(ToDoContext, related_name="todos", null=True, blank=True, on_delete=models.SET_NULL)

    tags = TaggableManager()

    class Meta:
        ordering = ("-last_update_time", "-priority")

    def __unicode__(self):
        return self.name

    @property
    def dict_repr(self):
        d = {f.name: getattr(self, f.name) or None for f in self._meta.fields}
        d.pop("owner")
        d.update({
            "priority": (self.priority, self.get_priority_display()),
            "tags": [{"id": tag.pk, "name": tag.name} for tag in self.tags.all()],
            "todo_list": self.todo_list,
            "todo_alerts": self.alerts.all(),
        })
        return d

    @property
    def is_done(self):
        return self.completion_time is not None

    @property
    def is_overdue(self):
        return not self.is_done and self.due_time < now()

    def mark_done(self):
        self.completion_time = now()
        return self

    def mark_undone(self):
        self.completion_time = None
        return self


class ToDoAlert(UserResource):
    todo = models.ForeignKey(ToDo, related_name="alerts")
    time = models.DateTimeField()
    celery_task_id = models.CharField(max_length=255, unique=True)

    def __unicode__(self):
        return ugettext("Alert for {todo} set for {time}".format(todo=self.todo, time=self.time))

    @property
    def dict_repr(self):
        return {
            "id": self.id,
            "time": self.time,
            "todo_id": self.todo.pk,
        }

    class Meta:
        ordering = ("time",)

@receiver(pre_save, sender=ToDoAlert)
def schedule_todo_alert_send(sender, **kwargs):
    if kwargs.get("raw"):
        return

    todo_alert = kwargs["instance"]
    current_celery_task_id = todo_alert.celery_task_id

    if current_celery_task_id is not None:
        # Revoking tasks only works with amqp, redis and mongodb for now (celery 2.5)
        control.revoke(current_celery_task_id)

    result = send_todo_alert.apply_async(args=[todo_alert], eta=todo_alert.time.astimezone(get_default_timezone()))
    todo_alert.celery_task_id = result.task_id

@receiver(user_activated)
def add_default_data(sender, **kwargs):
    user = kwargs.get("user")
    inbox_list, created = user.owned_todolists.get_or_create(
        name=unicode(_("Inbox"))
    )
    todo, created = user.owned_todos.get_or_create(
        name=unicode(_("Get to know MarkItDone")),
        todo_list=inbox_list
    )
