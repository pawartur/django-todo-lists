from django.utils.timezone import now, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from todo_lists.models import (
    ToDoList,
    ToDoContext,
    ToDo,
    ToDoAlert,
)


class ToDoModelsTestCase(TestCase):
    def setUp(self):
        user1 = User(username="user1", first_name="User", last_name="One", email="user1@example.com", is_active=True)
        user1.set_password("user1")
        user1.save()
        self.user1 = user1

        user2 = User(username="user2", first_name="User", last_name="Two", email="user2@example.com", is_active=True)
        user2.set_password("user2")
        user2.save()
        self.user2 = user2

        self.todo_list1 = ToDoList.objects.create(
            owner=self.user1,
            name="First ToDo List"
        )

        self.todo1 = ToDo.objects.create(
            owner=self.user1,
            name="First ToDo",
            notes="This is the first ToDo that will serve for model tests.",
            due_time=now()+timedelta(days=1),
            todo_list=self.todo_list1
        )

    def test_is_done(self):
        self.assertIsNone(self.todo1.completion_time)
        self.assertFalse(self.todo1.is_done)

        self.todo1.mark_done()
        self.todo1.save()

        self.assertIsNotNone(self.todo1.completion_time)
        self.assertTrue(self.todo1.is_done)

    def test_is_overdue(self):
        self.assertIsNone(self.todo1.completion_time)
        self.assertFalse(self.todo1.is_overdue)
        
        self.todo1.due_time = now() - timedelta(days=1)
        self.todo1.save() 

        self.assertTrue(self.todo1.is_overdue)

        self.todo1.mark_done()
        self.todo1.save()

        self.assertFalse(self.todo1.is_overdue)
        self.assertIsNotNone(self.todo1.completion_time)

    def test_add_to_todo_list(self):
        self.assertQuerysetEqual(self.todo_list1.todos.all(), ['<ToDo: First ToDo>'])

        todo_list2 = ToDoList.objects.create(
            owner=self.user1,
            name="Second ToDo List"
        )

        self.assertQuerysetEqual(todo_list2.todos.all(), [])

        self.todo1.todo_list = todo_list2
        self.todo1.save()

        self.assertQuerysetEqual(self.todo_list1.todos.all(), [])
        self.assertQuerysetEqual(todo_list2.todos.all(), ['<ToDo: First ToDo>'])

    def test_add_todo_context(self):
        self.assertIsNone(self.todo1.todo_context)

        todo_context1 = ToDoContext.objects.create(
            owner=self.user1,
            name="First ToDo Context"
        )

        self.assertQuerysetEqual(todo_context1.todos.all(), [])

        self.todo1.todo_context = todo_context1
        self.todo1.save()

        self.assertQuerysetEqual(todo_context1.todos.all(), ['<ToDo: First ToDo>'])

    def test_todo_priorities(self):
        self.assertEqual(self.todo1.priority, 2)
        self.assertEqual(self.todo1.get_priority_display(), u'Normal')

        self.todo1.priority = 1
        self.todo1.save()

        self.assertEqual(self.todo1.get_priority_display(), u'Low')

        self.todo1.priority = 3
        self.todo1.save()

        self.assertEqual(self.todo1.get_priority_display(), u'High')

    def test_tag_todo(self):
        self.assertQuerysetEqual(self.todo1.tags.all(), [])

        self.todo1.tags.add("important", "work")

        self.assertQuerysetEqual(self.todo1.tags.all().order_by("name"), ['<Tag: important>', '<Tag: work>'])

        self.todo1.tags.remove("important")

        self.assertQuerysetEqual(self.todo1.tags.all().order_by("name"), ['<Tag: work>'])

