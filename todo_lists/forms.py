from django import forms
from taggit.forms import TagField
from todo_lists.models import ToDoList, ToDoContext, ToDo, ToDoAlert


class UserResourceModelFormMixin(object):
    def __init__(self, owner=None, *args, **kwargs):
        self.owner = owner
        super(UserResourceModelFormMixin, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(UserResourceModelFormMixin, self).save(commit=False)

        if instance.owner_id is None:
            instance.owner = self.owner

        if commit:
            instance.save()
            self.save_m2m()

        return instance


class ToDoForm(UserResourceModelFormMixin, forms.ModelForm):
    is_done = forms.NullBooleanField(required=False)
    tags = TagField(required=False)

    def _clean_owned_resource(self, field_name):
        resource = self.cleaned_data[field_name]
        if resource is not None and resource.owner.pk != self.owner.pk:
            raise forms.ValidationError("%d is not a valid choice" % resource.pk)
        return resource

    def clean_todo_list(self):
        return self._clean_owned_resource("todo_list")

    def clean_todo_context(self):
        return self._clean_owned_resource("todo_context")

    def save(self, commit=True):
        todo = super(ToDoForm, self).save(commit=False)
        is_done = self.cleaned_data.get("is_done")
        if is_done is not None:
            todo = is_done and todo.mark_done() or todo.mark_undone()

        if commit:
            todo.save()
            self.save_m2m()

        return todo

    class Meta:
        model = ToDo
        exclude = ("owner", "creation_time", "last_update_time", "completion_time")


class ToDoAlertForm(UserResourceModelFormMixin, forms.ModelForm):

    def __init__(self, todo=None, *args, **kwargs):
        self.todo = todo
        super(ToDoAlertForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        alert = super(ToDoAlertForm, self).save(commit=False)

        if alert.todo_id is None:
            alert.todo = self.todo

        if commit:
            alert.save()

        return alert

    class Meta:
        model = ToDoAlert
        fields = ("time",)


class ToDoListForm(UserResourceModelFormMixin, forms.ModelForm):
    class Meta:
        model = ToDoList
        exclude = ("owner",)


class ToDoContextForm(UserResourceModelFormMixin, forms.ModelForm):
    class Meta:
        model = ToDoContext
        exclude = ("owner",)
