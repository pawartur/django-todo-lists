from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from rest_views.views import JSONRestView
from django.utils.translation import ugettext_lazy as _
from todo_lists.models import ToDoAlert
from todo_lists.forms import ToDo, ToDoAlertForm
from todo_lists.views.base import UserResourceViewMixin
from todo_lists.views.decorators import login_required_ajax
 

class ToDoAlertJSONView(UserResourceViewMixin, JSONRestView):
    model = ToDoAlert
    form_class = ToDoAlertForm

    def dispatch(self, request, *args, **kwargs):
        todo_pk = kwargs.get("todo_pk")
        user = request.user
        if not todo_pk:
            return super(ToDoAlertJSONView, self).dispatch(request, *args, **kwargs)
        try:
            todo = ToDo.objects.get(owner_id=user.pk, pk=todo_pk)
        except ToDo.DoesNotExist:
            # I have to do this here instead of raising Http404, because the mixin that
            # catches all these exceptions and returns the following response is applied
            # later in the mro. Probably not the bes inheritance chain...
            return HttpResponse(content=_("Not found"), status=404, mimetype="application/json")
        else:
            self.todo = todo
        return super(ToDoAlertJSONView, self).dispatch(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super(ToDoAlertJSONView, self).get_queryset()
        assert queryset.model is ToDoAlert, "Don't use ToDoAlertViewMixin with views that don't act on ToDoAlert model instances!"
        return queryset.filter(todo_id=self.todo.pk)

    def get_form_kwargs(self):
        kwargs = super(ToDoAlertJSONView, self).get_form_kwargs()
        kwargs.update({"todo": self.todo})
        return kwargs


todo_alert_json_view = never_cache(login_required_ajax(ToDoAlertJSONView.as_view()))
