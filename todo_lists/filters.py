import django_filters
from taggit.models import Tag
from todo_lists.models import ToDo


class IsNullFilter(django_filters.BooleanFilter):
    def filter(self, qs, value):
        if value is not None:
            return qs.filter(**{'%s__isnull' % (self.name,): value})
        return qs


class ToDoFilterSet(django_filters.FilterSet):
    tags = django_filters.ModelChoiceFilter(queryset=Tag.objects.all())
    not_done = IsNullFilter(name="completion_time")

    class Meta:
        model = ToDo
        fields = ("priority", "todo_list", "todo_context")
