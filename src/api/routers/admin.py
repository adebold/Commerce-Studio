"""
Admin Portal API Router
Provides backend functionality for the admin portal including analytics, security, compliance, and billing management.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

# Data Models
class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    token_limit: Optional[int] = None

class SystemSettings(BaseModel):
    maintenance_mode: bool = False
    auto_scaling: bool = True
    debug_logging: bool = False
    two_factor_auth: bool = True
    ip_whitelisting: bool = True
    session_timeout: bool = True

class SecurityEvent(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    source_ip: str
    user_agent: str
    status: str
    details: str

# Mock data for demonstration
MOCK_ANALYTICS_DATA = {
    "api_usage": {
        "total_calls": 2400000,
        "monthly_growth": 22,
        "daily_average": 80000,
        "peak_hour": "14:00",
        "endpoints": [
            {"name": "/api/v1/products", "calls": 850000, "percentage": 35.4},
            {"name": "/api/v1/customers", "calls": 720000, "percentage": 30.0},
            {"name": "/api/v1/orders", "calls": 480000, "percentage": 20.0},
            {"name": "/api/v1/analytics", "calls": 350000, "percentage": 14.6}
        ]
    },
    "storage": {
        "total_gb": 847,
        "monthly_growth": 18,
        "by_type": [
            {"type": "Images", "size_gb": 425, "percentage": 50.2},
            {"type": "Documents", "size_gb": 254, "percentage": 30.0},
            {"type": "Logs", "size_gb": 168, "percentage": 19.8}
        ]
    },
    "integrations": {
        "total_connected": 156,
        "monthly_growth": 12,
        "by_platform": [
            {"platform": "Shopify", "count": 68, "percentage": 43.6},
            {"platform": "Magento", "count": 42, "percentage": 26.9},
            {"platform": "WooCommerce", "count": 28, "percentage": 17.9},
            {"platform": "BigCommerce", "count": 18, "percentage": 11.5}
        ]
    }
}

MOCK_SECURITY_EVENTS = [
    SecurityEvent(
        id=1,
        timestamp=datetime.now() - timedelta(hours=2),
        event_type="Suspicious Login",
        source_ip="192.168.1.100",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status="Blocked",
        details="Multiple failed login attempts from unusual location"
    ),
    SecurityEvent(
        id=2,
        timestamp=datetime.now() - timedelta(hours=4),
        event_type="Rate Limit Exceeded",
        source_ip="10.0.0.50",
        user_agent="Python/3.9 requests/2.25.1",
        status="Throttled",
        details="API rate limit exceeded: 1000 requests in 1 minute"
    ),
    SecurityEvent(
        id=3,
        timestamp=datetime.now() - timedelta(hours=6),
        event_type="Unusual API Access",
        source_ip="203.0.113.42",
        user_agent="curl/7.68.0",
        status="Monitored",
        details="Access to sensitive endpoints outside business hours"
    )
]

# Analytics Endpoints
@router.get("/analytics/overview")
async def get_analytics_overview():
    """Get comprehensive analytics overview"""
    return {
        "success": True,
        "data": MOCK_ANALYTICS_DATA,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/analytics/export")
async def export_analytics(
    format: str = Query("csv", regex="^(csv|pdf|json)$"),
    date_range: str = Query("30d", regex="^(7d|30d|90d|1y)$")
):
    """Export analytics data in specified format"""
    return {
        "success": True,
        "message": f"Analytics report exported successfully as {format.upper()}",
        "download_url": f"/downloads/analytics-{date_range}-{datetime.now().strftime('%Y%m%d')}.{format}",
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    }

# Security Endpoints
@router.get("/security/overview")
async def get_security_overview():
    """Get security dashboard overview"""
    return {
        "success": True,
        "data": {
            "security_score": 99.9,
            "threats_blocked": 2847,
            "vulnerabilities": 0,
            "ssl_coverage": 100,
            "recent_events": len(MOCK_SECURITY_EVENTS),
            "monthly_growth": {
                "threats_blocked": 15,
                "security_score": 0.2
            }
        },
        "timestamp": datetime.now().isoformat()
    }

@router.get("/security/events")
async def get_security_events(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    event_type: Optional[str] = None
):
    """Get paginated security events"""
    events = MOCK_SECURITY_EVENTS
    if event_type:
        events = [e for e in events if event_type.lower() in e.event_type.lower()]
    
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "success": True,
        "data": {
            "events": [e.dict() for e in events[start:end]],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(events),
                "pages": (len(events) + limit - 1) // limit
            }
        }
    }

@router.get("/security/events/{event_id}")
async def get_security_event_details(event_id: int):
    """Get detailed information about a specific security event"""
    event = next((e for e in MOCK_SECURITY_EVENTS if e.id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Security event not found")
    
    return {
        "success": True,
        "data": {
            **event.dict(),
            "additional_details": {
                "geolocation": "Unknown Location",
                "threat_level": "Medium",
                "response_action": "Automatic block applied",
                "investigation_status": "Completed"
            }
        }
    }

@router.post("/security/events/{event_id}/acknowledge")
async def acknowledge_security_event(event_id: int):
    """Acknowledge a security event"""
    event = next((e for e in MOCK_SECURITY_EVENTS if e.id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Security event not found")
    
    return {
        "success": True,
        "message": f"Security event {event_id} has been acknowledged",
        "data": {
            "event_id": event_id,
            "status": "acknowledged",
            "acknowledged_at": "2024-01-15T10:30:00Z",
            "acknowledged_by": "admin@varai.com"
        }
    }

@router.post("/security/events/{event_id}/escalate")
async def escalate_security_event(event_id: int):
    """Escalate a security event"""
    event = next((e for e in MOCK_SECURITY_EVENTS if e.id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Security event not found")
    
    return {
        "success": True,
        "message": f"Security event {event_id} has been escalated to security team",
        "data": {
            "event_id": event_id,
            "status": "escalated",
            "escalated_at": "2024-01-15T10:30:00Z",
            "escalated_by": "admin@varai.com",
            "assigned_to": "security-team@varai.com",
            "priority": "high"
        }
    }

@router.get("/security/export")
async def export_security_report(
    format: str = Query("pdf", regex="^(csv|pdf|json)$"),
    date_range: str = Query("30d", regex="^(7d|30d|90d|1y)$")
):
    """Export security report"""
    return {
        "success": True,
        "message": f"Security report exported successfully as {format.upper()}",
        "download_url": f"/downloads/security-{date_range}-{datetime.now().strftime('%Y%m%d')}.{format}",
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    }

# Compliance Endpoints
@router.get("/compliance/overview")
async def get_compliance_overview():
    """Get compliance status overview"""
    return {
        "success": True,
        "data": {
            "soc2_status": "Compliant",
            "hipaa_status": "Compliant",
            "gdpr_status": "Compliant",
            "last_audit": "2024-11-15",
            "next_audit": "2025-05-15",
            "compliance_score": 98.5,
            "certifications": [
                {
                    "name": "SOC 2 Type II",
                    "status": "Active",
                    "expires": "2025-11-15",
                    "issuer": "Independent Auditor"
                },
                {
                    "name": "HIPAA Compliance",
                    "status": "Active",
                    "expires": "2025-12-01",
                    "issuer": "Healthcare Compliance Auditor"
                }
            ]
        }
    }

@router.post("/compliance/generate-report")
async def generate_compliance_report(
    report_type: str = Query(..., regex="^(soc2|hipaa|gdpr|all)$"),
    format: str = Query("pdf", regex="^(pdf|docx)$")
):
    """Generate compliance report"""
    return {
        "success": True,
        "message": f"{report_type.upper()} compliance report generated successfully",
        "report_id": f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "download_url": f"/downloads/compliance-{report_type}-{datetime.now().strftime('%Y%m%d')}.{format}",
        "expires_at": (datetime.now() + timedelta(hours=48)).isoformat()
    }

@router.get("/compliance/download/{report_id}")
async def download_compliance_report(report_id: str):
    """Download compliance report"""
    return {
        "success": True,
        "message": f"Report {report_id} download initiated",
        "download_url": f"/downloads/{report_id}.pdf",
        "file_size": "2.4 MB"
    }

# Billing Endpoints
@router.get("/billing/overview")
async def get_billing_overview():
    """Get billing dashboard overview"""
    return {
        "success": True,
        "data": {
            "monthly_revenue": 47320,
            "monthly_growth": 15,
            "total_customers": 1247,
            "active_subscriptions": 892,
            "churn_rate": 2.3,
            "arpu": 189,
            "revenue_by_plan": [
                {"plan": "Enterprise", "revenue": 28392, "percentage": 60.0},
                {"plan": "Professional", "revenue": 14196, "percentage": 30.0},
                {"plan": "Starter", "revenue": 4732, "percentage": 10.0}
            ]
        }
    }

@router.get("/billing/invoices")
async def get_billing_invoices(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None
):
    """Get paginated billing invoices"""
    mock_invoices = [
        {
            "id": 1,
            "customer": "Acme Eyewear Co.",
            "amount": 199.00,
            "status": "Paid",
            "date": "2025-01-15",
            "invoice_number": "INV-2025-001"
        },
        {
            "id": 2,
            "customer": "Vision Plus Store",
            "amount": 999.00,
            "status": "Paid",
            "date": "2025-01-20",
            "invoice_number": "INV-2025-002"
        },
        {
            "id": 3,
            "customer": "Optical Boutique",
            "amount": 49.00,
            "status": "Pending",
            "date": "2025-01-20",
            "invoice_number": "INV-2025-003"
        }
    ]
    
    if status:
        mock_invoices = [inv for inv in mock_invoices if inv["status"].lower() == status.lower()]
    
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "success": True,
        "data": {
            "invoices": mock_invoices[start:end],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(mock_invoices),
                "pages": (len(mock_invoices) + limit - 1) // limit
            }
        }
    }

@router.get("/billing/invoices/{invoice_id}")
async def get_invoice_details(invoice_id: int):
    """Get detailed invoice information"""
    return {
        "success": True,
        "data": {
            "id": invoice_id,
            "invoice_number": f"INV-2025-{invoice_id:03d}",
            "customer": "Acme Eyewear Co.",
            "amount": 199.00,
            "tax": 19.90,
            "total": 218.90,
            "status": "Paid",
            "date": "2025-01-15",
            "due_date": "2025-02-14",
            "payment_method": "Credit Card",
            "items": [
                {"description": "Professional Plan", "quantity": 1, "rate": 199.00, "amount": 199.00}
            ]
        }
    }

@router.get("/billing/export")
async def export_billing_report(
    format: str = Query("csv", regex="^(csv|pdf|excel)$"),
    date_range: str = Query("30d", regex="^(7d|30d|90d|1y)$")
):
    """Export billing report"""
    return {
        "success": True,
        "message": f"Billing report exported successfully as {format.upper()}",
        "download_url": f"/downloads/billing-{date_range}-{datetime.now().strftime('%Y%m%d')}.{format}",
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    }

# Settings Endpoints
@router.get("/settings/system")
async def get_system_settings():
    """Get current system settings"""
    return {
        "success": True,
        "data": {
            "maintenance_mode": False,
            "auto_scaling": True,
            "debug_logging": False,
            "two_factor_auth": True,
            "ip_whitelisting": True,
            "session_timeout": True
        }
    }

@router.put("/settings/system")
async def update_system_settings(settings: SystemSettings):
    """Update system settings"""
    return {
        "success": True,
        "message": "System settings updated successfully",
        "data": settings.dict()
    }

@router.put("/settings/toggle/{setting_name}")
async def toggle_system_setting(setting_name: str, enabled: bool):
    """Toggle a specific system setting"""
    valid_settings = [
        "maintenance_mode", "auto_scaling", "debug_logging",
        "two_factor_auth", "ip_whitelisting", "session_timeout"
    ]
    
    if setting_name not in valid_settings:
        raise HTTPException(status_code=400, detail="Invalid setting name")
    
    return {
        "success": True,
        "message": f"{setting_name.replace('_', ' ').title()} {'enabled' if enabled else 'disabled'} successfully",
        "data": {setting_name: enabled}
    }

# Customer Management Endpoints (Enhanced)
@router.get("/customers")
async def get_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    plan: Optional[str] = None
):
    """Get paginated customers with filtering"""
    # This would typically query a database
    return {
        "success": True,
        "data": {
            "customers": [],  # Would be populated from database
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 1247,
                "pages": 125
            }
        }
    }

@router.put("/customers/{customer_id}")
async def update_customer(customer_id: int, customer_data: CustomerUpdate):
    """Update customer information"""
    return {
        "success": True,
        "message": f"Customer {customer_id} updated successfully",
        "data": customer_data.dict(exclude_none=True)
    }

@router.post("/customers/{customer_id}/suspend")
async def suspend_customer(customer_id: int):
    """Suspend a customer account"""
    return {
        "success": True,
        "message": f"Customer {customer_id} has been suspended",
        "data": {"customer_id": customer_id, "status": "suspended"}
    }

@router.post("/customers/{customer_id}/activate")
async def activate_customer(customer_id: int):
    """Activate a customer account"""
    return {
        "success": True,
        "message": f"Customer {customer_id} has been activated",
        "data": {"customer_id": customer_id, "status": "active"}
    }