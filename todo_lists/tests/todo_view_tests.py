from django.core.urlresolvers import reverse
from django.utils.timezone import now, timedelta, localtime
from django.test import TestCase
from todo_lists.tests.mixins import ToDoViewsTestCaseMixin
from todo_lists.models import ToDo

class ToDoViewsTestCase(ToDoViewsTestCaseMixin, TestCase):
    def setUp(self):
        super(ToDoViewsTestCase, self).setUp()
        self.create_n_todo_lists(2, self.user1)
        self.create_n_todo_lists(2, self.user2)
        self.create_n_todo_contexts(1, self.user1)
        self.create_n_todos(10, self.user1, self.todo_lists[0])
        self.create_n_todos(2, self.user1, self.todo_lists[1])
        self.create_n_todos(5, self.user2, self.todo_lists[2])

    def test_details(self):
        # First 12 todos belong to user1
        todo = self.todos[3]
        # Other 5 todos belong to user2 who's not logged in
        wrong_todo = self.todos[14]

        # Everybody can see only resources that belong to them
        wrong_url = reverse("todo-resource", args=[wrong_todo.pk])
        response = self.http_client.get(wrong_url)
        self.assertEqual(response.status_code, 404)

        url = reverse("todo-resource", args=[todo.pk])

        self.assertAjaxLoginRequired(url)

        response = self.http_client.get(url)
        parsed_content = self.get_parsed_json_respone(response)
        self.assertDictEqual(parsed_content, {
            u'object': {
                u'completion_time': u'',
                u'creation_time': localtime(todo.creation_time).strftime('%Y-%m-%d %H:%M'), # receiving localized times from server
                u'due_time': localtime(todo.due_time).strftime('%Y-%m-%d %H:%M'),
                u'id': todo.pk,
                u'last_update_time': localtime(todo.last_update_time).strftime('%Y-%m-%d %H:%M'),
                u'name': u"User's {user} ToDo no.4".format(user=self.user1),
                u'notes': u'This is a ToDo that will serve for model tests. Its number is 4',
                u'tags': [],
                u'todo_alerts': [],
                u'priority': [2, u'Normal'],
                u'todo_context': u'',
                u'todo_list': todo.todo_list.dict_repr
            }
        })

    def test_change(self):
        # First 12 todos belong to user1
        todo = self.todos[6]
        # Other 5 todos belong to user2 who's not logged in
        wrong_todo = self.todos[14]

        # Everybody can change only resources that belong to them
        wrong_url = reverse("todo-resource", args=[wrong_todo.pk])
        response = self.http_client.put(wrong_url, {})
        self.assertEqual(response.status_code, 404)

        url = reverse("todo-resource", args=[todo.pk])

        self.assertAjaxLoginRequired(url)

        response = self.http_client.put(url, {})
        parsed_content = self.get_parsed_json_respone(response)

        self.assertDictEqual(parsed_content["errors"], 
            {u'name': [u'This field is required.'],
            u'todo_list': [u'This field is required.']}
        )

        in_hundred_days = now() + timedelta(days=100)
        response = self.http_client.put(url, {
            "owner": 999,
            "name": "Changed ToDo",
            "notes": todo.notes,
            "due_time": localtime(in_hundred_days).strftime('%Y-%m-%d %H:%M'), # sending localized times to server
            "priority": 2,
            "todo_list": self.todo_lists[1].pk,
            "tags": ["changed"],
        })
        parsed_content = self.get_parsed_json_respone(response)
        self.assertSetEqual(set(parsed_content["object"].keys()), set(todo.dict_repr.keys()))

        todo = ToDo.objects.get(pk=todo.pk)
        self.assertEqual("Changed ToDo", todo.name)
        self.assertEqual(self.user1, todo.owner)
        self.assertEqual(2, todo.priority)
        self.assertEqual(todo.due_time, in_hundred_days.replace(second=0, microsecond=0))
        self.assertQuerysetEqual(todo.tags.all(), ['<Tag: changed>'])
        self.assertEqual(todo.todo_list, self.todo_lists[1])

    def test_mark_done(self):
        todo = self.todos[10]
        self.assertFalse(todo.is_done)

        url = reverse("todo-resource", args=[todo.pk])

        self.assertAjaxLoginRequired(url)

        response = self.http_client.put(url, {
            "name": todo.name,
            "notes": todo.notes,
            "due_time": localtime(todo).due_time.strftime('%Y-%m-%d %H:%M'),
            "priority": todo.priority,
            "todo_list": todo.todo_list.pk,
            "tags": list(todo.tags.values_list("name", flat=True)),
            "is_done": True,
        })
        parsed_content = self.get_parsed_json_respone(response)

        self.assertIsNotNone(parsed_content["object"]["completion_time"])
        todo = ToDo.objects.get(pk=todo.pk)
        self.assertTrue(todo.is_done)

    def test_mark_undone(self):
        todo = self.todos[8]
        todo.mark_done()
        todo.save()

        self.assertTrue(todo.is_done)

        url = reverse("todo-resource", args=[todo.pk])

        self.assertAjaxLoginRequired(url)

        response = self.http_client.put(url, {
            "name": todo.name,
            "notes": todo.notes,
            "due_time": localtime(todo).due_time.strftime('%Y-%m-%d %H:%M'),
            "priority": todo.priority,
            "todo_list": todo.todo_list.pk,
            "tags": list(todo.tags.values_list("name", flat=True)),
            "is_done": False,
        })
        parsed_content = self.get_parsed_json_respone(response)

        self.assertFalse(parsed_content["object"]["completion_time"])
        todo = ToDo.objects.get(pk=todo.pk)
        self.assertFalse(todo.is_done)

    def test_delete(self):
        # First 12 todos belong to user1
        todo = self.todos[1]
        # Other 5 todos belong to user2 who's not logged in
        wrong_todo = self.todos[14]

        # Everybody can delete only resources that belong to them
        wrong_url = reverse("todo-resource", args=[wrong_todo.pk])
        response = self.http_client.delete(wrong_url)
        self.assertEqual(response.status_code, 404)

        url = reverse("todo-resource", args=[todo.pk])

        self.assertAjaxLoginRequired(url)

        response = self.http_client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(ToDo.objects.filter(pk=todo.pk).exists())

    def test_add(self):
        url = reverse("todo-collection")
        self.assertAjaxLoginRequired(url)

        response = self.http_client.post(url, {})
        parsed_content = self.get_parsed_json_respone(response)
        
        self.assertDictEqual(parsed_content,
            {u'errors': 
                {u'name': [u'This field is required.'],
                u'todo_list': [u'This field is required.']}
            }
        )

        due_time = now() + timedelta(days=5)
        response = self.http_client.post(url, {
            "name": "New ToDo",
            "notes": "This is a ToDo created in a test",
            "due_time": localtime(due_time).strftime('%Y-%m-%d %H:%M'), # sending localized times to server
            "todo_list": self.todo_lists[0].pk,
            "tags": ["new", "test"],
        })
        parsed_content = self.get_parsed_json_respone(response)
        parsed_object = parsed_content["object"]
        pk = parsed_object["id"]
        todo = ToDo.objects.get(pk=pk)
        self.assertEqual(todo.owner, self.user1)
        self.assertEqual(parsed_object["due_time"], localtime(due_time).strftime('%Y-%m-%d %H:%M'))
        self.assertSetEqual(set(parsed_object.keys()), set(todo.dict_repr.keys()))

    def test_list(self):
        url = reverse("todo-collection")

        self.assertAjaxLoginRequired(url)

        response = self.http_client.get(url)
        parsed_content = self.get_parsed_json_respone(response)

        # user1 is logged in so he can get only his todos.
        # There are 12 of them, but they come in batches of 10
        # ToDos should be sorted in descending order by last_update_time
        # and in this case it's creation time
        first_ten = list(reversed(self.todos[:12]))[:10]
        for i, todo in enumerate(first_ten):
            parsed_object = parsed_content["object_list"][i]
            self.assertSetEqual(set(parsed_object.keys()), set(todo.dict_repr.keys()))
            self.assertEqual(parsed_object["id"], todo.pk)

        self.assertTrue(parsed_content["not_all"])

        response = self.http_client.get(url, {"exclude": map(lambda x: x.pk, first_ten)})
        parsed_content = self.get_parsed_json_respone(response)

        for i, todo in enumerate(list(reversed(self.todos[:12]))[10:12]):
            parsed_object = parsed_content["object_list"][i]
            self.assertSetEqual(set(parsed_object.keys()), set(todo.dict_repr.keys()))
            self.assertEqual(parsed_object["id"], todo.pk)

        self.assertFalse(parsed_content["not_all"])

        # now let's check what happens if we send sth stupid as the "exclude" param
        response = self.http_client.get(url, {"exclude": "something stupid"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content, "Wrong exclude query param given")

    def test_filtered_list(self):
        url = reverse("todo-collection")

        self.assertAjaxLoginRequired(url)

        response = self.http_client.get(url, {"todo_list": self.todo_lists[1].pk})
        parsed_content = self.get_parsed_json_respone(response)
        # 2 out of 12 todos owned by user1 are in our chosen list
        self.assertEqual(len(parsed_content["object_list"]), 2)
        for parsed_todo in parsed_content["object_list"]:
            self.assertEqual(parsed_todo["todo_list"]["id"], self.todo_lists[1].pk)

        all_owned = self.user1.owned_todos.all()
        half = len(all_owned) // 2

        for todo in all_owned[:half]:
            todo.todo_context = self.todo_contexts[0]
            todo.priority = 1 # Low priority
            todo.mark_done()
            todo.save()

        response = self.http_client.get(url, {"todo_context": self.todo_contexts[0].pk})
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(len(parsed_content["object_list"]), 6)
        for parsed_todo in parsed_content["object_list"]:
            self.assertEqual(parsed_todo["todo_context"]["id"], self.todo_contexts[0].pk)

        response = self.http_client.get(url, {"priority": 2})
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(len(parsed_content["object_list"]), 6)
        for parsed_todo in parsed_content["object_list"]:
            self.assertEqual(parsed_todo["priority"][0], 2)

        todo = self.user1.owned_todos.all()[0]
        todo.tags.add("test_tag")
        tag = todo.tags.get()
        response = self.http_client.get(url, {"tags": tag.pk})
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(len(parsed_content["object_list"]), 1)
        self.assertEqual(parsed_content["object_list"][0]["id"], todo.pk)

        response = self.http_client.get(url, {"not_done": True})
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(len(parsed_content["object_list"]), 6)
        for parsed_todo in parsed_content["object_list"]:
            self.assertFalse(parsed_todo["completion_time"])

        response = self.http_client.get(url, {"not_done": False})
        parsed_content = self.get_parsed_json_respone(response)
        self.assertEqual(len(parsed_content["object_list"]), 6)
        for parsed_todo in parsed_content["object_list"]:
            self.assertTrue(parsed_todo["completion_time"])
