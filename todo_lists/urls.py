from django.conf.urls import patterns, include, url
from todo_lists.models import  ToDoList, ToDoContext, ToDo, ToDoAlert
from todo_lists.views import (
    todo_json_view,
    todo_list_json_view,
    todo_context_json_view,
    todo_alert_json_view
)


urlpatterns = patterns('',
    url(r'^$', todo_json_view, name="todo-collection"),
    url(r'^(?P<pk>\d+)/$', todo_json_view, name="todo-resource"),
    url(r'^lists/$', todo_list_json_view, name="todo-list-collection"),
    url(r'^lists/(?P<pk>\d+)/$', todo_list_json_view, name="todo-list-resource"),
    url(r'^contexts/$', todo_context_json_view, name="todo-context-collection"),
    url(r'^contexts/(?P<pk>\d+)/$', todo_context_json_view, name="todo-context-resource"),
    url(r'^(?P<todo_pk>\d+)/alerts/$', todo_alert_json_view, name="todo-alert-collection"),
    url(r'^(?P<todo_pk>\d+)/alerts/(?P<pk>\d+)/$', todo_alert_json_view, name="todo-alert-resource"),
)
