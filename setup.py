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
    long_description=open('README.md').read(),
    package_data = {
        'todo_lists': [
            'static/js/todo_lists/*.js',
            'static/css/*.css',
        ]
    },
)
