from django.core.urlresolvers import reverse
from django.utils.timezone import timedelta, localtime
from django.test import TestCase
from todo_lists.tests.mixins import ToDoViewsTestCaseMixin
from todo_lists.models import ToDoAlert


class ToDoAlertViewsTestCase(ToDoViewsTestCaseMixin, TestCase):
    def setUp(self):
        super(ToDoAlertViewsTestCase, self).setUp()
        self.create_n_todo_lists(1, self.user1)
        self.create_n_todo_lists(1, self.user2)
        self.create_n_todos(2, self.user1, self.todo_lists[0])
        self.create_n_todos(1, self.user2, self.todo_lists[1])
        self.todos[0].alerts.create(owner=self.user1, time=self.todos[0].due_time - timedelta(hours=1))
        self.todos[0].alerts.create(owner=self.user1, time=self.todos[0].due_time - timedelta(days=1))
        self.todos[2].alerts.create(owner=self.user2, time=self.todos[2].due_time - timedelta(days=1))

    def test_list(self):
        todo = self.todos[0]

        url = reverse("todo-alert-collection", args=[todo.pk])

        self.assertAjaxLoginRequired(url)

        response = self.http_client.get(url)

        parsed_content = self.get_parsed_json_respone(response)
        # The currently logged in user1 only owns 2 todo alerts
        self.assertEqual(len(parsed_content["object_list"]), 2)
        first_alert = parsed_content["object_list"][0]
        second_alert = parsed_content["object_list"][1]
        self.assertEqual(first_alert["time"], localtime(todo.due_time - timedelta(days=1)).strftime('%Y-%m-%d %H:%M'))
        self.assertEqual(second_alert["time"], localtime(todo.due_time - timedelta(hours=1)).strftime('%Y-%m-%d %H:%M'))

    def test_add(self):
        # First 2 todos belong to user1
        todo = self.todos[1]
        # Another todo belongs to user2 who's not logged in
        wrong_todo = self.todos[2]

        # Everybody can see only resources that belong to them
        wrong_url = reverse("todo-alert-collection", args=[wrong_todo.pk])
        response = self.http_client.post(wrong_url, {})
        self.assertEqual(response.status_code, 404)

        url = reverse("todo-alert-collection", args=[todo.pk])

        self.assertAjaxLoginRequired(url)
        alert_time = todo.due_time - timedelta(hours=1)
        local_alert_time = localtime(alert_time)

        response = self.http_client.post(url, {
            "time": local_alert_time.strftime('%Y-%m-%d %H:%M'),
        })
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(parsed_content["object"]["todo_id"], todo.pk)
        self.assertEqual(parsed_content["object"]["time"], local_alert_time.strftime('%Y-%m-%d %H:%M'))

        todo_alert = ToDoAlert.objects.get(pk=parsed_content["object"]["id"])
        self.assertEqual(todo_alert.owner, self.user1)

    def test_change(self):
        todo = self.todos[0]
        todo_alert = todo.alerts.all()[0]

        wrong_url = reverse("todo-alert-resource", args=[self.todos[1].pk, todo_alert.pk])
        right_url = reverse("todo-alert-resource", args=[todo.pk, todo_alert.pk])

        old_time = todo_alert.time
        new_time = todo_alert.time - timedelta(hours=2)
        change_data = {
            "time": localtime(new_time).strftime('%Y-%m-%d %H:%M')
        }

        response = self.http_client.put(wrong_url, change_data)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(todo_alert.time, old_time)

        self.assertAjaxLoginRequired(right_url)

        response = self.http_client.put(right_url, change_data)
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(parsed_content["object"]["time"], localtime(new_time).strftime('%Y-%m-%d %H:%M'))
        todo_alert = ToDoAlert.objects.get(pk=todo_alert.pk)
        self.assertEqual(todo_alert.time, new_time.replace(second=0, microsecond=0))

    def test_delete(self):
        todo = self.todos[0]
        todo_alert = todo.alerts.all()[0]

        wrong_url = reverse("todo-alert-resource", args=[self.todos[1].pk, todo_alert.pk])
        right_url = reverse("todo-alert-resource", args=[todo.pk, todo_alert.pk])

        response = self.http_client.delete(wrong_url)
        self.assertEqual(response.status_code, 404)
        todo_alert = ToDoAlert.objects.get(pk=todo_alert.pk)

        self.assertAjaxLoginRequired(right_url)

        response = self.http_client.delete(right_url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(ToDoAlert.objects.filter(pk=todo_alert.pk).exists())
