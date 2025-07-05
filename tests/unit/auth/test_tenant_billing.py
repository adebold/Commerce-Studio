"""
Unit tests for tenant billing features.

These tests cover the billing-related workflows for System Administrators,
including plan management, billing cycles, and payment processing.
"""

import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
import uuid
import json

from src.auth.tenant import TenantManager, Tenant, TenantSettings


class MockBillingService:
    """Mock billing service for testing."""
    
    def __init__(self):
        self.plans = {
            "free": {"price": 0, "features": ["basic_analytics", "standard_support"]},
            "basic": {"price": 99, "features": ["basic_analytics", "standard_support", "api_access"]},
            "premium": {"price": 299, "features": ["advanced_analytics", "priority_support", "api_access", "custom_branding"]},
            "enterprise": {"price": 999, "features": ["advanced_analytics", "dedicated_support", "api_access", "custom_branding", "sla_guarantee"]}
        }
        self.invoices = {}
        self.payments = {}
        
    def create_invoice(self, tenant_id, plan, billing_period_start, billing_period_end):
        """Create an invoice for a tenant."""
        invoice_id = f"inv-{uuid.uuid4()}"
        amount = self.plans[plan]["price"]
        
        invoice = {
            "id": invoice_id,
            "tenant_id": tenant_id,
            "plan": plan,
            "amount": amount,
            "status": "pending",
            "billing_period_start": billing_period_start.isoformat(),
            "billing_period_end": billing_period_end.isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "due_date": (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        self.invoices[invoice_id] = invoice
        return invoice
        
    def process_payment(self, invoice_id, payment_method, amount):
        """Process a payment for an invoice."""
        if invoice_id not in self.invoices:
            return None
            
        invoice = self.invoices[invoice_id]
        
        if invoice["status"] != "pending":
            return None
            
        if amount != invoice["amount"]:
            return None
            
        payment_id = f"pmt-{uuid.uuid4()}"
        
        payment = {
            "id": payment_id,
            "invoice_id": invoice_id,
            "tenant_id": invoice["tenant_id"],
            "amount": amount,
            "payment_method": payment_method,
            "status": "completed",
            "created_at": datetime.utcnow().isoformat()
        }
        
        self.payments[payment_id] = payment
        
        # Update invoice status
        invoice["status"] = "paid"
        
        return payment
        
    def get_tenant_invoices(self, tenant_id):
        """Get all invoices for a tenant."""
        return [inv for inv in self.invoices.values() if inv["tenant_id"] == tenant_id]
        
    def get_tenant_payments(self, tenant_id):
        """Get all payments for a tenant."""
        return [pmt for pmt in self.payments.values() if pmt["tenant_id"] == tenant_id]


class TestTenantBilling(unittest.TestCase):
    """Test cases for tenant billing features."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.storage_backend = MagicMock()
        self.tenant_manager = TenantManager(storage_backend=self.storage_backend)
        self.billing_service = MockBillingService()
        
        # Create a test tenant
        self.test_tenant = self.tenant_manager.create_tenant(
            name="Test Tenant",
            domain="test-tenant.example.com",
            admin_email="admin@test-tenant.example.com",
            plan="basic"
        )
        
        # Reset the mock to clear the create_tenant call
        self.storage_backend.reset_mock()
        
    def test_create_invoice_for_tenant(self):
        """Test creating an invoice for a tenant."""
        # Set billing period
        billing_period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        billing_period_end = (billing_period_start.replace(month=billing_period_start.month+1) - timedelta(days=1))
        
        # Create invoice
        invoice = self.billing_service.create_invoice(
            tenant_id=self.test_tenant.id,
            plan=self.test_tenant.plan,
            billing_period_start=billing_period_start,
            billing_period_end=billing_period_end
        )
        
        # Verify invoice properties
        self.assertEqual(invoice["tenant_id"], self.test_tenant.id)
        self.assertEqual(invoice["plan"], "basic")
        self.assertEqual(invoice["amount"], 99)  # Price of basic plan
        self.assertEqual(invoice["status"], "pending")
        
    def test_process_payment_for_invoice(self):
        """Test processing a payment for an invoice."""
        # Set billing period
        billing_period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        billing_period_end = (billing_period_start.replace(month=billing_period_start.month+1) - timedelta(days=1))
        
        # Create invoice
        invoice = self.billing_service.create_invoice(
            tenant_id=self.test_tenant.id,
            plan=self.test_tenant.plan,
            billing_period_start=billing_period_start,
            billing_period_end=billing_period_end
        )
        
        # Process payment
        payment = self.billing_service.process_payment(
            invoice_id=invoice["id"],
            payment_method="credit_card",
            amount=invoice["amount"]
        )
        
        # Verify payment properties
        self.assertEqual(payment["invoice_id"], invoice["id"])
        self.assertEqual(payment["tenant_id"], self.test_tenant.id)
        self.assertEqual(payment["amount"], 99)
        self.assertEqual(payment["status"], "completed")
        
        # Verify invoice status was updated
        updated_invoice = self.billing_service.invoices[invoice["id"]]
        self.assertEqual(updated_invoice["status"], "paid")
        
    def test_get_tenant_billing_history(self):
        """Test retrieving billing history for a tenant."""
        # Create multiple invoices and payments
        for month in range(3):
            billing_period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30*month)
            billing_period_end = (billing_period_start.replace(month=billing_period_start.month+1) - timedelta(days=1))
            
            invoice = self.billing_service.create_invoice(
                tenant_id=self.test_tenant.id,
                plan=self.test_tenant.plan,
                billing_period_start=billing_period_start,
                billing_period_end=billing_period_end
            )
            
            self.billing_service.process_payment(
                invoice_id=invoice["id"],
                payment_method="credit_card",
                amount=invoice["amount"]
            )
        
        # Get tenant invoices
        invoices = self.billing_service.get_tenant_invoices(self.test_tenant.id)
        
        # Verify invoices
        self.assertEqual(len(invoices), 3)
        for invoice in invoices:
            self.assertEqual(invoice["tenant_id"], self.test_tenant.id)
            self.assertEqual(invoice["status"], "paid")
        
        # Get tenant payments
        payments = self.billing_service.get_tenant_payments(self.test_tenant.id)
        
        # Verify payments
        self.assertEqual(len(payments), 3)
        for payment in payments:
            self.assertEqual(payment["tenant_id"], self.test_tenant.id)
            self.assertEqual(payment["status"], "completed")
            
    def test_change_tenant_plan(self):
        """Test changing a tenant's plan."""
        # Update tenant plan
        updated_tenant = self.tenant_manager.update_tenant(
            tenant_id=self.test_tenant.id,
            user_id="test-admin",
            updates={"plan": "premium"}
        )
        
        # Verify plan was updated
        self.assertEqual(updated_tenant.plan, "premium")
        
        # Create invoice for new plan
        billing_period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        billing_period_end = (billing_period_start.replace(month=billing_period_start.month+1) - timedelta(days=1))
        
        invoice = self.billing_service.create_invoice(
            tenant_id=self.test_tenant.id,
            plan=updated_tenant.plan,
            billing_period_start=billing_period_start,
            billing_period_end=billing_period_end
        )
        
        # Verify invoice amount reflects new plan
        self.assertEqual(invoice["plan"], "premium")
        self.assertEqual(invoice["amount"], 299)  # Price of premium plan


class TestTenantBillingFailureScenarios(unittest.TestCase):
    """Test cases for tenant billing failure scenarios."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.storage_backend = MagicMock()
        self.tenant_manager = TenantManager(storage_backend=self.storage_backend)
        self.billing_service = MockBillingService()
        
        # Create a test tenant
        self.test_tenant = self.tenant_manager.create_tenant(
            name="Test Tenant",
            domain="test-tenant.example.com",
            admin_email="admin@test-tenant.example.com",
            plan="basic"
        )
        
        # Create an invoice
        billing_period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        billing_period_end = (billing_period_start.replace(month=billing_period_start.month+1) - timedelta(days=1))
        
        self.invoice = self.billing_service.create_invoice(
            tenant_id=self.test_tenant.id,
            plan=self.test_tenant.plan,
            billing_period_start=billing_period_start,
            billing_period_end=billing_period_end
        )
        
    def test_payment_with_incorrect_amount(self):
        """Test payment processing with incorrect amount."""
        # Process payment with incorrect amount
        payment = self.billing_service.process_payment(
            invoice_id=self.invoice["id"],
            payment_method="credit_card",
            amount=50  # Less than the invoice amount
        )
        
        # Verify payment failed
        self.assertIsNone(payment)
        
        # Verify invoice status was not updated
        invoice = self.billing_service.invoices[self.invoice["id"]]
        self.assertEqual(invoice["status"], "pending")
        
    def test_payment_for_nonexistent_invoice(self):
        """Test payment processing for a nonexistent invoice."""
        # Process payment for nonexistent invoice
        payment = self.billing_service.process_payment(
            invoice_id="nonexistent-invoice",
            payment_method="credit_card",
            amount=99
        )
        
        # Verify payment failed
        self.assertIsNone(payment)
        
    def test_payment_for_already_paid_invoice(self):
        """Test payment processing for an already paid invoice."""
        # Process payment
        self.billing_service.process_payment(
            invoice_id=self.invoice["id"],
            payment_method="credit_card",
            amount=99
        )
        
        # Try to process payment again
        payment = self.billing_service.process_payment(
            invoice_id=self.invoice["id"],
            payment_method="credit_card",
            amount=99
        )
        
        # Verify second payment failed
        self.assertIsNone(payment)
        
    def test_suspend_tenant_for_payment_failure(self):
        """Test suspending a tenant for payment failure."""
        # Suspend tenant
        suspended_tenant = self.tenant_manager.suspend_tenant(
            tenant_id=self.test_tenant.id,
            user_id="system",
            reason="Payment overdue"
        )
        
        # Verify tenant was suspended
        self.assertEqual(suspended_tenant.status, "suspended")
        
        # Verify audit log was created
        log_entries = self.tenant_manager._audit_logs[self.test_tenant.id]
        suspend_log = log_entries[1]  # First entry is create, second is suspend
        self.assertEqual(suspend_log.action, "tenant.suspend")
        self.assertEqual(suspend_log.details["reason"], "Payment overdue")


if __name__ == "__main__":
    unittest.main()