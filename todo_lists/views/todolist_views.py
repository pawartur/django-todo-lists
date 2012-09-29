from django.views.decorators.cache import never_cache
from rest_views.views import JSONRestView
from todo_lists.models import ToDoList
from todo_lists.forms import ToDoListForm
from todo_lists.views.base import UserResourceViewMixin
from rest_views.decorators import login_required_ajax


class ToDoListJSONView(UserResourceViewMixin, JSONRestView):
    model = ToDoList
    form_class = ToDoListForm


todo_list_json_view = never_cache(login_required_ajax(ToDoListJSONView.as_view()))
