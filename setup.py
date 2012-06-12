from distutils.core import setup

setup(
    name='django-todo-lists',
    version='0.9.0',
    author='Artur Wdowiarski',
    author_email='arturwdowiarski@gmail.com',
    packages=['todo_lists', 'todo_lists.views', 'todo_lists.tests', 'todo_lists.templatetags'],
    url='http://github.com/pawartur/django-todo-lists/tree/master',
    license='LICENSE.txt',
    description="Simple django todo app with frontend based on Bootstrap and Backbone.js.",
    long_description=open('README.txt').read(),
    package_data = {
        'todo_lists': [
            'static/js/*.js',
            'static/js/collections/*.js',
            'static/js/models/*.js',
            'static/js/views/*.js',
            'static/js/views/todo_alerts/*.js',
            'static/js/views/todo_contexts/*.js',
            'static/js/views/todo_lists/*.js',
            'static/js/views/todos/*.js',
            'static/js/templates/*.html',
            'static/js/templates/todo_alerts/*.html',
            'static/js/templates/todo_contexts/*.html',
            'static/js/templates/todo_lists/*.html',
            'static/js/templates/todos/*.html',
            'static/css/*.css',
        ]
    },
)
