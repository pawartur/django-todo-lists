import json
from functools import wraps
from django.conf import settings
from django.http import HttpResponse

def login_required_ajax(view_func=None, login_url=None):
    def decorator(view_func):
        @wraps(view_func)
        def view(request, *args, **kwargs):
            if request.user.is_authenticated():
                return view_func(request, *args, **kwargs)
            content = {
                "message": "Login required",
                "login_url": login_url or settings.LOGIN_URL
            }
            return HttpResponse(content=json.dumps(content), mimetype="application/json")
        return view
    if view_func is None:
        return decorator
    return decorator(view_func)
