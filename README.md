## django-todo-lists

This is a simple django application for todo management. It supports lists, contexts, tags and priorities.
It consists in two components - RESTful AJAX API and javascript frontend.

You can see it in action at [markitdone.com](http://markitdone.com) (the code behind this app is at [MarkItDone](https://github.com/pawartur/MarkItDone))

The backend API is built with:
* celery (you need a broker that supports revoking tasks, currently it's amqp, redis and mongodb)
* django-taggit
* django-filter
* django-rest-views (https://github.com/pawartur/django-rest-views)

The frontend is built with:
* Twitter Bootstrap (included templates use bootstrap-specific markup)
* require.js (witch text and order plugins)
* Backbone.js
* bootstrap-datepicker (https://github.com/eternicode/bootstrap-datepicker)
* my forked version of bootstrap-timepicker (the original: https://github.com/jdewit/bootstrap-timepicker)
* bootstrap-extensions that I wrote for this particular project (https://github.com/pawartur/backbone-extensions)

INSTALLATION:
If you want to see what it looks like, just install this package, include todo_lists.urls in your django project and either use router.js provided with this package, or mimic it's action in your own router. (well... it's a little more complicated than that; better take a look at [MarkItDone](https://github.com/pawartur/MarkItDone))
