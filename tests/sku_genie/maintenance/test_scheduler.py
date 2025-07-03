"""
Tests for the SKU-Genie scheduler.

This module contains tests for the scheduler functionality.
"""

import unittest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

from src.sku_genie.maintenance.scheduler import Task, Scheduler


class TestTask(unittest.TestCase):
    """Tests for the Task class."""
    
    def test_task_initialization(self):
        """Test task initialization."""
        # Create a task
        task_id = "test_task"
        func = MagicMock()
        args = [1, 2, 3]
        kwargs = {"a": 1, "b": 2}
        schedule = "0 0 * * *"
        next_run = datetime.now()
        last_run = datetime.now() - timedelta(days=1)
        last_status = "completed"
        enabled = True
        description = "Test task"
        
        task = Task(
            task_id=task_id,
            func=func,
            args=args,
            kwargs=kwargs,
            schedule=schedule,
            next_run=next_run,
            last_run=last_run,
            last_status=last_status,
            enabled=enabled,
            description=description
        )
        
        # Check task attributes
        self.assertEqual(task.task_id, task_id)
        self.assertEqual(task.func, func)
        self.assertEqual(task.args, args)
        self.assertEqual(task.kwargs, kwargs)
        self.assertEqual(task.schedule, schedule)
        self.assertEqual(task.next_run, next_run)
        self.assertEqual(task.last_run, last_run)
        self.assertEqual(task.last_status, last_status)
        self.assertEqual(task.enabled, enabled)
        self.assertEqual(task.description, description)
    
    def test_task_to_dict(self):
        """Test converting a task to a dictionary."""
        # Create a task
        task_id = "test_task"
        func = MagicMock()
        schedule = "0 0 * * *"
        next_run = datetime.now()
        last_run = datetime.now() - timedelta(days=1)
        last_status = "completed"
        enabled = True
        description = "Test task"
        
        task = Task(
            task_id=task_id,
            func=func,
            schedule=schedule,
            next_run=next_run,
            last_run=last_run,
            last_status=last_status,
            enabled=enabled,
            description=description
        )
        
        # Convert task to dictionary
        task_dict = task.to_dict()
        
        # Check dictionary
        self.assertEqual(task_dict["task_id"], task_id)
        self.assertEqual(task_dict["schedule"], schedule)
        self.assertEqual(task_dict["next_run"], next_run)
        self.assertEqual(task_dict["last_run"], last_run)
        self.assertEqual(task_dict["last_status"], last_status)
        self.assertEqual(task_dict["enabled"], enabled)
        self.assertEqual(task_dict["description"], description)
    
    def test_task_from_dict(self):
        """Test creating a task from a dictionary."""
        # Create task data
        task_id = "test_task"
        func = MagicMock()
        schedule = "0 0 * * *"
        next_run = datetime.now()
        last_run = datetime.now() - timedelta(days=1)
        last_status = "completed"
        enabled = True
        description = "Test task"
        
        task_data = {
            "task_id": task_id,
            "schedule": schedule,
            "next_run": next_run,
            "last_run": last_run,
            "last_status": last_status,
            "enabled": enabled,
            "description": description
        }
        
        # Create task from dictionary
        task = Task.from_dict(task_data, func)
        
        # Check task attributes
        self.assertEqual(task.task_id, task_id)
        self.assertEqual(task.func, func)
        self.assertEqual(task.schedule, schedule)
        self.assertEqual(task.next_run, next_run)
        self.assertEqual(task.last_run, last_run)
        self.assertEqual(task.last_status, last_status)
        self.assertEqual(task.enabled, enabled)
        self.assertEqual(task.description, description)
    
    @patch("croniter.croniter")
    def test_update_next_run(self, mock_croniter):
        """Test updating the next run time."""
        # Create a task
        task_id = "test_task"
        func = MagicMock()
        schedule = "0 0 * * *"
        
        task = Task(
            task_id=task_id,
            func=func,
            schedule=schedule
        )
        
        # Mock croniter
        next_run = datetime.now() + timedelta(days=1)
        mock_croniter_instance = MagicMock()
        mock_croniter_instance.get_next.return_value = next_run
        mock_croniter.return_value = mock_croniter_instance
        
        # Update next run time
        task.update_next_run()
        
        # Check next run time
        self.assertEqual(task.next_run, next_run)
        
        # Check croniter was called with correct arguments
        mock_croniter.assert_called_once()
        args, kwargs = mock_croniter.call_args
        self.assertEqual(args[0], schedule)
        self.assertIsInstance(args[1], datetime)


class TestScheduler(unittest.TestCase):
    """Tests for the Scheduler class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.scheduler = Scheduler()
    
    @patch("src.sku_genie.maintenance.scheduler.get_database")
    async def test_add_task(self, mock_get_database):
        """Test adding a task to the scheduler."""
        # Mock database
        mock_db = MagicMock()
        mock_db.db.tasks.update_one = MagicMock()
        mock_get_database.return_value = mock_db
        
        # Add task
        task_id = "test_task"
        func = MagicMock()
        schedule = "0 0 * * *"
        description = "Test task"
        
        task = await self.scheduler.add_task(
            task_id=task_id,
            func=func,
            schedule=schedule,
            description=description
        )
        
        # Check task was added
        self.assertIn(task_id, self.scheduler.tasks)
        self.assertEqual(self.scheduler.tasks[task_id], task)
        
        # Check task attributes
        self.assertEqual(task.task_id, task_id)
        self.assertEqual(task.func, func)
        self.assertEqual(task.schedule, schedule)
        self.assertEqual(task.description, description)
        
        # Check task was saved to database
        mock_db.db.tasks.update_one.assert_called_once()
        args, kwargs = mock_db.db.tasks.update_one.call_args
        self.assertEqual(args[0], {"task_id": task_id})
        self.assertEqual(kwargs["upsert"], True)
    
    @patch("src.sku_genie.maintenance.scheduler.get_database")
    async def test_remove_task(self, mock_get_database):
        """Test removing a task from the scheduler."""
        # Mock database
        mock_db = MagicMock()
        mock_db.db.tasks.delete_one = MagicMock()
        mock_get_database.return_value = mock_db
        
        # Add task
        task_id = "test_task"
        func = MagicMock()
        
        self.scheduler.tasks[task_id] = Task(
            task_id=task_id,
            func=func
        )
        
        # Remove task
        result = await self.scheduler.remove_task(task_id)
        
        # Check task was removed
        self.assertTrue(result)
        self.assertNotIn(task_id, self.scheduler.tasks)
        
        # Check task was removed from database
        mock_db.db.tasks.delete_one.assert_called_once_with({"task_id": task_id})
    
    async def test_get_task(self):
        """Test getting a task by ID."""
        # Add task
        task_id = "test_task"
        func = MagicMock()
        
        task = Task(
            task_id=task_id,
            func=func
        )
        
        self.scheduler.tasks[task_id] = task
        
        # Get task
        result = await self.scheduler.get_task(task_id)
        
        # Check task was returned
        self.assertEqual(result, task)
    
    async def test_get_all_tasks(self):
        """Test getting all tasks."""
        # Add tasks
        task1_id = "test_task_1"
        task2_id = "test_task_2"
        func = MagicMock()
        
        task1 = Task(
            task_id=task1_id,
            func=func
        )
        
        task2 = Task(
            task_id=task2_id,
            func=func
        )
        
        self.scheduler.tasks[task1_id] = task1
        self.scheduler.tasks[task2_id] = task2
        
        # Get all tasks
        tasks = await self.scheduler.get_all_tasks()
        
        # Check tasks were returned
        self.assertEqual(len(tasks), 2)
        self.assertIn(task1, tasks)
        self.assertIn(task2, tasks)
    
    @patch("src.sku_genie.maintenance.scheduler.get_database")
    async def test_enable_task(self, mock_get_database):
        """Test enabling a task."""
        # Mock database
        mock_db = MagicMock()
        mock_db.db.tasks.update_one = MagicMock()
        mock_get_database.return_value = mock_db
        
        # Add task
        task_id = "test_task"
        func = MagicMock()
        
        task = Task(
            task_id=task_id,
            func=func,
            enabled=False
        )
        
        self.scheduler.tasks[task_id] = task
        
        # Enable task
        result = await self.scheduler.enable_task(task_id)
        
        # Check task was enabled
        self.assertTrue(result)
        self.assertTrue(task.enabled)
        
        # Check task was saved to database
        mock_db.db.tasks.update_one.assert_called_once()
    
    @patch("src.sku_genie.maintenance.scheduler.get_database")
    async def test_disable_task(self, mock_get_database):
        """Test disabling a task."""
        # Mock database
        mock_db = MagicMock()
        mock_db.db.tasks.update_one = MagicMock()
        mock_get_database.return_value = mock_db
        
        # Add task
        task_id = "test_task"
        func = MagicMock()
        
        task = Task(
            task_id=task_id,
            func=func,
            enabled=True
        )
        
        self.scheduler.tasks[task_id] = task
        
        # Disable task
        result = await self.scheduler.disable_task(task_id)
        
        # Check task was disabled
        self.assertTrue(result)
        self.assertFalse(task.enabled)
        
        # Check task was saved to database
        mock_db.db.tasks.update_one.assert_called_once()
    
    @patch("src.sku_genie.maintenance.scheduler.get_database")
    async def test_update_task_schedule(self, mock_get_database):
        """Test updating a task's schedule."""
        # Mock database
        mock_db = MagicMock()
        mock_db.db.tasks.update_one = MagicMock()
        mock_get_database.return_value = mock_db
        
        # Add task
        task_id = "test_task"
        func = MagicMock()
        old_schedule = "0 0 * * *"
        
        task = Task(
            task_id=task_id,
            func=func,
            schedule=old_schedule
        )
        
        self.scheduler.tasks[task_id] = task
        
        # Update task schedule
        new_schedule = "0 12 * * *"
        
        with patch.object(task, "update_next_run") as mock_update_next_run:
            result = await self.scheduler.update_task_schedule(task_id, new_schedule)
        
        # Check task schedule was updated
        self.assertTrue(result)
        self.assertEqual(task.schedule, new_schedule)
        
        # Check next run time was updated
        mock_update_next_run.assert_called_once()
        
        # Check task was saved to database
        mock_db.db.tasks.update_one.assert_called_once()
    
    async def test_run_task(self):
        """Test running a task immediately."""
        # Add task
        task_id = "test_task"
        func = MagicMock()
        func.return_value = "test_result"
        
        task = Task(
            task_id=task_id,
            func=func
        )
        
        self.scheduler.tasks[task_id] = task
        
        # Run task
        with patch.object(self.scheduler, "_execute_task") as mock_execute_task:
            mock_execute_task.return_value = "test_result"
            result = await self.scheduler.run_task(task_id)
        
        # Check task was executed
        mock_execute_task.assert_called_once_with(task)
        
        # Check result
        self.assertEqual(result, "test_result")
    
    async def test_execute_task(self):
        """Test executing a task."""
        # Create task
        task_id = "test_task"
        func = MagicMock()
        func.return_value = "test_result"
        args = [1, 2, 3]
        kwargs = {"a": 1, "b": 2}
        
        task = Task(
            task_id=task_id,
            func=func,
            args=args,
            kwargs=kwargs
        )
        
        # Execute task
        result = await self.scheduler._execute_task(task)
        
        # Check function was called with correct arguments
        func.assert_called_once_with(*args, **kwargs)
        
        # Check result
        self.assertEqual(result, "test_result")


if __name__ == "__main__":
    unittest.main()