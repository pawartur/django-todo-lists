import json
from django import template
from django.utils.safestring import mark_safe
from rest_views.helpers import CustomEncoder

register = template.Library()

@register.filter
def to_json(value):
    return mark_safe(json.dumps(value, cls=CustomEncoder))
