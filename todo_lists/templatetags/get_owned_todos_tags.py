import json
from django import template
from todo_lists.models import ToDo

register = template.Library()

@register.filter
def get_owned_todos_tags(user):
    values_list = set(ToDo.objects.filter(owner=user, tags__isnull=False).values_list("tags__id", "tags__name"))
    return [{"id": tag_id, "name": tag_name} for tag_id, tag_name in values_list]
