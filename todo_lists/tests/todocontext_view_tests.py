from django.core.urlresolvers import reverse
from django.test import TestCase
from todo_lists.tests.mixins import ToDoViewsTestCaseMixin
from todo_lists.models import ToDoContext

class ToDoContextViewsTestCase(ToDoViewsTestCaseMixin, TestCase):
    def setUp(self):
        super(ToDoContextViewsTestCase, self).setUp()
        self.create_n_todo_contexts(2, self.user1)
        self.create_n_todo_contexts(1, self.user2)

    def test_list(self):
        url = reverse("todo-context-collection")

        self.assertAjaxLoginRequired(url)

        response = self.http_client.get(url)
        parsed_content = self.get_parsed_json_respone(response)
        # The currently logged in user1 owns two todo contexts
        self.assertEqual(len(parsed_content["object_list"]), 2)
        first_context = parsed_content["object_list"][0]
        second_context = parsed_content["object_list"][1]
        self.assertEqual(first_context["name"], "User's {user} ToDo Context no.1".format(user=self.user1))
        self.assertEqual(second_context["name"], "User's {user} ToDo Context no.2".format(user=self.user1))

    def test_add(self):
        url = reverse("todo-context-collection")

        self.assertAjaxLoginRequired(url)

        response = self.http_client.post(url, {
            "name": "New context",
        })
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(parsed_content["object"]["name"], "New context")

        todo_context = ToDoContext.objects.get(pk=parsed_content["object"]["id"])
        self.assertEqual(todo_context.owner, self.user1)

    def test_change(self):
        # The first 2 todo contexts belong to user1 who is currently logged in
        url = reverse("todo-context-resource", args=[self.todo_contexts[0].pk])
        # Another one belongs to user2
        wrong_url = reverse("todo-context-resource", args=[self.todo_contexts[2].pk])

        response = self.http_client.put(wrong_url, {})
        self.assertEqual(response.status_code, 404)

        self.assertAjaxLoginRequired(url)

        response = self.http_client.put(url, {
            "name": "Changed name",
        })
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(parsed_content["object"]["name"], "Changed name")
        todo_context = ToDoContext.objects.get(pk=self.todo_contexts[0].pk)
        self.assertEqual(todo_context.name, "Changed name")

    def test_delete(self):
        # The first 2 todo contexts belong to user1 who is currently logged in
        url = reverse("todo-context-resource", args=[self.todo_contexts[0].pk])
        # Another one belongs to user2
        wrong_url = reverse("todo-context-resource", args=[self.todo_contexts[2].pk])

        response = self.http_client.delete(wrong_url, {})
        self.assertEqual(response.status_code, 404)

        self.assertAjaxLoginRequired(url)

        response = self.http_client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(ToDoContext.objects.filter(pk=self.todo_contexts[0].pk).exists())
