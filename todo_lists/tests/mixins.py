import json
from django.test.client import Client
from django.utils.timezone import now, timedelta, localtime
from django.contrib.auth.models import User
from todo_lists.models import (
    ToDoList,
    ToDoContext,
    ToDo,
)

class ToDoViewsTestCaseMixin(object):
    def create_n_todos(self, n, user, todo_list):
        self.todos = getattr(self, "todos", [])
        for i in range(n):
            todo = ToDo.objects.create(
                owner=user,
                name="User's {user} ToDo no.{no}".format(user=user, no=i+1),
                notes="This is a ToDo that will serve for model tests. Its number is {no}".format(no=i+1),
                due_time=now()+timedelta(days=i+1), # Saving times in UTC to db
                todo_list=todo_list,
            )
            self.todos.append(todo)

    def create_n_todo_lists(self, n, user):
        self.todo_lists = getattr(self, "todo_lists", [])
        for i in range(n):
            todo_list = ToDoList.objects.create(
            owner=user,
            name="User's {user} ToDo List no.{no}".format(user=user, no=i+1)
            )
            self.todo_lists.append(todo_list)

    def create_n_todo_contexts(self, n, user):
        self.todo_contexts = getattr(self, "todo_contexts", [])
        for i in range(n):
            todo_context = ToDoContext.objects.create(
            owner=user,
            name="User's {user} ToDo Context no.{no}".format(user=user, no=i+1)
            )
            self.todo_contexts.append(todo_context)

    def get_parsed_json_respone(self, response):
        return json.loads(response.content)

    def assertAjaxLoginRequired(self, url):
        response = Client().get(url, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        parsed_content = self.get_parsed_json_respone(response)
        try:
            self.assertEqual(parsed_content.get("message"), "Login required")
        except AssertionError:
            self.fail("The view didn't respond with 'login required' message to a request from anonymous user.")
        try:
            self.assertTrue("login_url" in parsed_content)
        except AssertionError:
            self.fail("The view did respond with 'login required' message to a request from anonymous user, but returned no login url.")

    def setUp(self):
        user1 = User(username="user1", first_name="User", last_name="One", email="user1@example.com", is_active=True)
        user1.set_password("user1")
        user1.save()
        self.user1 = user1

        user2 = User(username="user2", first_name="User", last_name="Two", email="user2@example.com", is_active=True)
        user2.set_password("user2")
        user2.save()
        self.user2 = user2

        self.http_client = Client()
        self.http_client.login(username="user1", password="user1")
