"""
Unit tests for the TenantManager class.

These tests cover the tenant management workflows for System Administrators,
including tenant creation, updates, suspension, and deletion.
"""

import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
import uuid

from src.auth.tenant import (
    TenantManager, Tenant, TenantSettings, SSOProvider, 
    PasswordPolicy, AuditLogEntry
)


class TestTenantManager(unittest.TestCase):
    """Test cases for the TenantManager class."""

    def setUp(self):
        """Set up test fixtures."""
        self.storage_backend = MagicMock()
        self.tenant_manager = TenantManager(storage_backend=self.storage_backend)
        
        # Create a test tenant for reuse in tests
        self.test_tenant = self.tenant_manager.create_tenant(
            name="Test Tenant",
            domain="test-tenant.example.com",
            admin_email="admin@test-tenant.example.com",
            plan="enterprise"
        )
        
        # Reset the mock to clear the create_tenant call
        self.storage_backend.reset_mock()
        
    def test_create_tenant(self):
        """Test creating a new tenant."""
        # Create a new tenant
        tenant = self.tenant_manager.create_tenant(
            name="New Tenant",
            domain="new-tenant.example.com",
            admin_email="admin@new-tenant.example.com",
            plan="basic"
        )
        
        # Verify tenant properties
        self.assertEqual(tenant.name, "New Tenant")
        self.assertEqual(tenant.domain, "new-tenant.example.com")
        self.assertEqual(tenant.billing_email, "admin@new-tenant.example.com")
        self.assertEqual(tenant.technical_contact_email, "admin@new-tenant.example.com")
        self.assertEqual(tenant.plan, "basic")
        self.assertEqual(tenant.status, "active")
        
        # Verify tenant is stored in manager
        self.assertIn(tenant.id, self.tenant_manager._tenants)
        self.assertEqual(self.tenant_manager._domains["new-tenant.example.com"], tenant.id)
        
        # Verify audit log was created
        self.assertIn(tenant.id, self.tenant_manager._audit_logs)
        self.assertEqual(len(self.tenant_manager._audit_logs[tenant.id]), 1)
        log_entry = self.tenant_manager._audit_logs[tenant.id][0]
        self.assertEqual(log_entry.action, "tenant.create")
        
        # Verify storage backend was called
        self.storage_backend.save_tenant.assert_called_once_with(tenant)
        
    def test_get_tenant(self):
        """Test retrieving a tenant by ID."""
        # Get the test tenant
        tenant = self.tenant_manager.get_tenant(self.test_tenant.id)
        
        # Verify tenant properties
        self.assertEqual(tenant.id, self.test_tenant.id)
        self.assertEqual(tenant.name, "Test Tenant")
        
    def test_get_tenant_by_domain(self):
        """Test retrieving a tenant by domain."""
        # Get the test tenant by domain
        tenant = self.tenant_manager.get_tenant_by_domain("test-tenant.example.com")
        
        # Verify tenant properties
        self.assertEqual(tenant.id, self.test_tenant.id)
        self.assertEqual(tenant.name, "Test Tenant")
        
    def test_update_tenant(self):
        """Test updating a tenant."""
        # Update the test tenant
        updates = {
            "name": "Updated Tenant Name",
            "plan": "premium",
            "billing_email": "billing@test-tenant.example.com",
            "settings": {
                "mfa_enabled": True,
                "session_timeout_minutes": 30
            }
        }
        
        updated_tenant = self.tenant_manager.update_tenant(
            tenant_id=self.test_tenant.id,
            user_id="test-admin",
            updates=updates
        )
        
        # Verify tenant properties were updated
        self.assertEqual(updated_tenant.name, "Updated Tenant Name")
        self.assertEqual(updated_tenant.plan, "premium")
        self.assertEqual(updated_tenant.billing_email, "billing@test-tenant.example.com")
        self.assertEqual(updated_tenant.settings.mfa_enabled, True)
        self.assertEqual(updated_tenant.settings.session_timeout_minutes, 30)
        
        # Verify audit log was created
        log_entries = self.tenant_manager._audit_logs[self.test_tenant.id]
        self.assertEqual(len(log_entries), 2)  # Create + Update
        update_log = log_entries[1]
        self.assertEqual(update_log.action, "tenant.update")
        self.assertEqual(update_log.user_id, "test-admin")
        
        # Verify storage backend was called
        self.storage_backend.save_tenant.assert_called_once_with(updated_tenant)
        
    def test_suspend_tenant(self):
        """Test suspending a tenant."""
        # Suspend the test tenant
        suspended_tenant = self.tenant_manager.suspend_tenant(
            tenant_id=self.test_tenant.id,
            user_id="test-admin",
            reason="Payment overdue"
        )
        
        # Verify tenant status was updated
        self.assertEqual(suspended_tenant.status, "suspended")
        
        # Verify audit log was created
        log_entries = self.tenant_manager._audit_logs[self.test_tenant.id]
        self.assertEqual(len(log_entries), 2)  # Create + Suspend
        suspend_log = log_entries[1]
        self.assertEqual(suspend_log.action, "tenant.suspend")
        self.assertEqual(suspend_log.user_id, "test-admin")
        self.assertEqual(suspend_log.details["reason"], "Payment overdue")
        
        # Verify storage backend was called
        self.storage_backend.save_tenant.assert_called_once_with(suspended_tenant)
        
    def test_activate_tenant(self):
        """Test activating a suspended tenant."""
        # First suspend the tenant
        suspended_tenant = self.tenant_manager.suspend_tenant(
            tenant_id=self.test_tenant.id,
            user_id="test-admin",
            reason="Payment overdue"
        )
        
        # Reset the mock
        self.storage_backend.reset_mock()
        
        # Now activate the tenant
        activated_tenant = self.tenant_manager.activate_tenant(
            tenant_id=self.test_tenant.id,
            user_id="test-admin"
        )
        
        # Verify tenant status was updated
        self.assertEqual(activated_tenant.status, "active")
        
        # Verify audit log was created
        log_entries = self.tenant_manager._audit_logs[self.test_tenant.id]
        self.assertEqual(len(log_entries), 3)  # Create + Suspend + Activate
        activate_log = log_entries[2]
        self.assertEqual(activate_log.action, "tenant.activate")
        self.assertEqual(activate_log.user_id, "test-admin")
        
        # Verify storage backend was called
        self.storage_backend.save_tenant.assert_called_once_with(activated_tenant)
        
    def test_delete_tenant(self):
        """Test deleting a tenant."""
        # Delete the test tenant
        result = self.tenant_manager.delete_tenant(
            tenant_id=self.test_tenant.id,
            user_id="test-admin"
        )
        
        # Verify deletion was successful
        self.assertTrue(result)
        
        # Verify tenant was removed from manager
        self.assertNotIn(self.test_tenant.id, self.tenant_manager._tenants)
        self.assertNotIn("test-tenant.example.com", self.tenant_manager._domains)
        
        # Verify audit log was created (but not deleted)
        self.assertIn(self.test_tenant.id, self.tenant_manager._audit_logs)
        log_entries = self.tenant_manager._audit_logs[self.test_tenant.id]
        self.assertEqual(len(log_entries), 2)  # Create + Delete
        delete_log = log_entries[1]
        self.assertEqual(delete_log.action, "tenant.delete")
        self.assertEqual(delete_log.user_id, "test-admin")
        
        # Verify storage backend was called
        self.storage_backend.delete_tenant.assert_called_once_with(self.test_tenant.id)
        
    def test_list_tenants(self):
        """Test listing tenants with filtering and pagination."""
        # Create additional test tenants
        self.tenant_manager.create_tenant(
            name="Tenant A",
            domain="tenant-a.example.com",
            admin_email="admin@tenant-a.example.com",
            plan="basic"
        )
        
        self.tenant_manager.create_tenant(
            name="Tenant B",
            domain="tenant-b.example.com",
            admin_email="admin@tenant-b.example.com",
            plan="premium"
        )
        
        suspended_tenant = self.tenant_manager.create_tenant(
            name="Suspended Tenant",
            domain="suspended.example.com",
            admin_email="admin@suspended.example.com",
            plan="basic"
        )
        
        self.tenant_manager.suspend_tenant(
            tenant_id=suspended_tenant.id,
            user_id="test-admin",
            reason="Test suspension"
        )
        
        # Test listing all tenants
        result = self.tenant_manager.list_tenants()
        self.assertEqual(len(result["data"]), 4)
        self.assertEqual(result["pagination"]["total"], 4)
        
        # Test filtering by status
        result = self.tenant_manager.list_tenants(filters={"status": "suspended"})
        self.assertEqual(len(result["data"]), 1)
        self.assertEqual(result["data"][0].id, suspended_tenant.id)
        
        # Test searching
        result = self.tenant_manager.list_tenants(filters={"search": "tenant a"})
        self.assertEqual(len(result["data"]), 1)
        self.assertEqual(result["data"][0].name, "Tenant A")
        
        # Test pagination
        result = self.tenant_manager.list_tenants(page=1, page_size=2)
        self.assertEqual(len(result["data"]), 2)
        self.assertEqual(result["pagination"]["total"], 4)
        self.assertEqual(result["pagination"]["total_pages"], 2)
        
    def test_get_tenant_audit_logs(self):
        """Test retrieving audit logs for a tenant."""
        # Create some audit logs
        for i in range(5):
            self.tenant_manager._add_audit_log(
                tenant_id=self.test_tenant.id,
                user_id="test-admin",
                action=f"test.action.{i}",
                details={"test": f"detail {i}"}
            )
            
        # Get audit logs
        result = self.tenant_manager.get_tenant_audit_logs(self.test_tenant.id)
        
        # Verify logs were retrieved
        self.assertEqual(len(result["data"]), 6)  # 5 test logs + 1 create log
        self.assertEqual(result["pagination"]["total"], 6)
        
        # Test filtering by action
        result = self.tenant_manager.get_tenant_audit_logs(
            tenant_id=self.test_tenant.id,
            filters={"action": "test.action.3"}
        )
        self.assertEqual(len(result["data"]), 1)
        self.assertEqual(result["data"][0].action, "test.action.3")
        
        # Test filtering by user
        result = self.tenant_manager.get_tenant_audit_logs(
            tenant_id=self.test_tenant.id,
            filters={"user_id": "test-admin"}
        )
        self.assertEqual(len(result["data"]), 5)  # Excluding the create log by "system"
        
        # Test pagination
        result = self.tenant_manager.get_tenant_audit_logs(
            tenant_id=self.test_tenant.id,
            page=1,
            page_size=3
        )
        self.assertEqual(len(result["data"]), 3)
        self.assertEqual(result["pagination"]["total"], 6)
        self.assertEqual(result["pagination"]["total_pages"], 2)


class TestTenantManagerDisasterRecovery(unittest.TestCase):
    """Test cases for disaster recovery scenarios in TenantManager."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.storage_backend = MagicMock()
        self.tenant_manager = TenantManager(storage_backend=self.storage_backend)
        
    def test_load_from_storage(self):
        """Test loading tenants from storage backend."""
        # Create mock tenants and audit logs
        mock_tenant1 = Tenant(
            id="tenant-1",
            name="Tenant 1",
            domain="tenant1.example.com",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            settings=TenantSettings(),
            status="active"
        )
        
        mock_tenant2 = Tenant(
            id="tenant-2",
            name="Tenant 2",
            domain="tenant2.example.com",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            settings=TenantSettings(),
            status="active"
        )
        
        mock_log1 = AuditLogEntry(
            id="log-1",
            tenant_id="tenant-1",
            user_id="user-1",
            action="tenant.create",
            details={},
            timestamp=datetime.utcnow()
        )
        
        mock_log2 = AuditLogEntry(
            id="log-2",
            tenant_id="tenant-1",
            user_id="user-1",
            action="tenant.update",
            details={},
            timestamp=datetime.utcnow()
        )
        
        # Configure storage backend mock
        self.storage_backend.load_tenants.return_value = [mock_tenant1, mock_tenant2]
        self.storage_backend.load_audit_logs.return_value = [mock_log1, mock_log2]
        
        # Load from storage
        self.tenant_manager.load_from_storage()
        
        # Verify tenants were loaded
        self.assertEqual(len(self.tenant_manager._tenants), 2)
        self.assertIn("tenant-1", self.tenant_manager._tenants)
        self.assertIn("tenant-2", self.tenant_manager._tenants)
        self.assertEqual(self.tenant_manager._domains["tenant1.example.com"], "tenant-1")
        self.assertEqual(self.tenant_manager._domains["tenant2.example.com"], "tenant-2")
        
        # Verify audit logs were loaded
        self.assertEqual(len(self.tenant_manager._audit_logs["tenant-1"]), 2)
        
    @patch("src.auth.tenant.TenantManager.load_from_storage")
    def test_recovery_from_storage_on_init(self, mock_load):
        """Test that TenantManager can recover from storage on initialization."""
        # Create a new TenantManager with storage backend
        TenantManager(storage_backend=self.storage_backend)
        
        # Verify load_from_storage was called
        mock_load.assert_called_once()
        
    def test_tenant_data_consistency(self):
        """Test that tenant data remains consistent after operations."""
        # Create a test tenant
        tenant = self.tenant_manager.create_tenant(
            name="Test Tenant",
            domain="test-tenant.example.com",
            admin_email="admin@test-tenant.example.com",
            plan="enterprise"
        )
        
        # Update the tenant
        self.tenant_manager.update_tenant(
            tenant_id=tenant.id,
            user_id="test-admin",
            updates={"name": "Updated Name"}
        )
        
        # Verify tenant in manager matches what would be saved to storage
        saved_tenant = self.storage_backend.save_tenant.call_args[0][0]
        manager_tenant = self.tenant_manager.get_tenant(tenant.id)
        
        self.assertEqual(saved_tenant.id, manager_tenant.id)
        self.assertEqual(saved_tenant.name, manager_tenant.name)
        self.assertEqual(saved_tenant.domain, manager_tenant.domain)
        self.assertEqual(saved_tenant.status, manager_tenant.status)


if __name__ == "__main__":
    unittest.main()