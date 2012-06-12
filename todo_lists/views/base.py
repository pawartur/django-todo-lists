class UserResourceViewMixin(object):
    def get_queryset(self):
        queryset = super(UserResourceViewMixin, self).get_queryset()
        return queryset.filter(owner=self.request.user)

    def get_form_kwargs(self):
        kwargs = super(UserResourceViewMixin, self).get_form_kwargs()
        kwargs.update({'owner': self.request.user})
        return kwargs
