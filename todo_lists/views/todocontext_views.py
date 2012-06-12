from django.views.decorators.cache import never_cache
from rest_views.views import JSONRestView
from todo_lists.models import ToDoContext
from todo_lists.forms import ToDoContextForm
from todo_lists.views.base import UserResourceViewMixin
from todo_lists.views.decorators import login_required_ajax


class ToDoContextJSONView(UserResourceViewMixin, JSONRestView):
    model = ToDoContext
    form_class = ToDoContextForm


todo_context_json_view = never_cache(login_required_ajax(ToDoContextJSONView.as_view()))
