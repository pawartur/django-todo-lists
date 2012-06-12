from django.views.decorators.cache import never_cache
from rest_views.views import JSONRestView
from todo_lists.models import ToDo
from todo_lists.forms import ToDoForm
from todo_lists.views.base import UserResourceViewMixin
from todo_lists.filters import ToDoFilterSet
from todo_lists.views.decorators import login_required_ajax


class ToDoJSONView(UserResourceViewMixin, JSONRestView):
    model = ToDo
    form_class = ToDoForm
    limit = 10

    def get_queryset(self):
        queryset = super(ToDoJSONView, self).get_queryset()
        filterset = ToDoFilterSet(queryset=queryset, data=self.request.GET or None)
        return filterset.qs


todo_json_view = never_cache(login_required_ajax(ToDoJSONView.as_view()))
    