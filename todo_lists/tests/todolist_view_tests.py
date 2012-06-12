from django.core.urlresolvers import reverse
from django.test import TestCase
from todo_lists.tests.mixins import ToDoViewsTestCaseMixin
from todo_lists.models import ToDoList


class ToDoListViewsTestCase(ToDoViewsTestCaseMixin, TestCase):
    def setUp(self):
        super(ToDoListViewsTestCase, self).setUp()
        self.create_n_todo_lists(2, self.user1)
        self.create_n_todo_lists(1, self.user2)

    def test_list(self):
        url = reverse("todo-list-collection")

        self.assertAjaxLoginRequired(url)

        response = self.http_client.get(url)
        parsed_content = self.get_parsed_json_respone(response)
        # The currently logged in user1 owns 2 todo lists
        self.assertEqual(len(parsed_content["object_list"]), 2)
        first_list = parsed_content["object_list"][0]
        second_list = parsed_content["object_list"][1]
        self.assertEqual(first_list["name"], "User's {user} ToDo List no.1".format(user=self.user1))
        self.assertEqual(second_list["name"], "User's {user} ToDo List no.2".format(user=self.user1))

    def test_add(self):
        url = reverse("todo-list-collection")

        self.assertAjaxLoginRequired(url)

        response = self.http_client.post(url, {
            "name": "New list",
        })
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(parsed_content["object"]["name"], "New list")
        self.assertEqual(parsed_content["object"]["overdue_todos_no"], 0)

        todo_list = ToDoList.objects.get(pk=parsed_content["object"]["id"])
        self.assertEqual(todo_list.owner, self.user1)

    def test_change(self):
        # The first 2 todo listts belong to user1 who is currently logged in
        url = reverse("todo-list-resource", args=[self.todo_lists[0].pk])
        # Another one belongs to user2
        wrong_url = reverse("todo-list-resource", args=[self.todo_lists[2].pk])

        response = self.http_client.put(wrong_url, {})
        self.assertEqual(response.status_code, 404)

        self.assertAjaxLoginRequired(url)

        response = self.http_client.put(url, {
            "name": "Changed name",
        })
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(parsed_content["object"]["name"], "Changed name")
        todo_list = ToDoList.objects.get(pk=self.todo_lists[0].pk)
        self.assertEqual(todo_list.name, "Changed name")

    def test_delete(self):
        # The first 2 todo listts belong to user1 who is currently logged in
        url = reverse("todo-list-resource", args=[self.todo_lists[0].pk])
        # Another one belongs to user2
        wrong_url = reverse("todo-list-resource", args=[self.todo_lists[2].pk])

        response = self.http_client.delete(wrong_url, {})
        self.assertEqual(response.status_code, 404)

        self.assertAjaxLoginRequired(url)

        response = self.http_client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(ToDoList.objects.filter(pk=self.todo_lists[0].pk).exists())
