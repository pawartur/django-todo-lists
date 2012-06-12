from celery.task import task
from django.core.mail import send_mail
from django.utils.translation import ugettext, ugettext_lazy as _

@task
def send_todo_alert(todo_alert, **kwargs):
    todo = todo_alert.todo
    user = todo_alert.owner
    if not user.email:
        return
    # TODO: Set a proper language and make a nice looking email.
    try:
        send_mail(
            subject=_('This is a reminder for one of todos from MarkItDone'),
            message=_('This is a reminder for todo {todo}. Its due time is {due_time}').format(todo=todo, due_time=todo.due_time),
            from_email=user.email,
            recipient_list=[user.email],
            fail_silently=False
        )
    except Exception, e:
        send_todo_alert.retry(args=[x, y], exc=e, countdown=180, kwargs=kwargs)

