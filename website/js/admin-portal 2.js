// Admin Portal JavaScript - Backend API Integration
// Connects all admin portal functionality to FastAPI backend

class AdminPortalAPI {
    constructor() {
        this.baseURL = '/api/v1/admin';
        this.currentSection = 'customers';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Navigation listeners
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Customer management listeners
        this.setupCustomerListeners();
        
        // Analytics listeners
        this.setupAnalyticsListeners();
        
        // Security listeners
        this.setupSecurityListeners();
        
        // Compliance listeners
        this.setupComplianceListeners();
        
        // Billing listeners
        this.setupBillingListeners();
        
        // Settings listeners
        this.setupSettingsListeners();
    }

    setupCustomerListeners() {
        // View customer buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-customer-btn')) {
                const customerId = e.target.getAttribute('data-customer-id');
                this.viewCustomer(customerId);
            }
        });

        // Edit customer buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-customer-btn')) {
                const customerId = e.target.getAttribute('data-customer-id');
                this.editCustomer(customerId);
            }
        });

        // Save customer changes
        document.addEventListener('click', (e) => {
            if (e.target.id === 'saveCustomerChanges') {
                this.saveCustomerChanges();
            }
        });

        // Search customers
        const searchInput = document.getElementById('customerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCustomers(e.target.value);
            });
        }
    }

    setupAnalyticsListeners() {
        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-btn')) {
                const reportType = e.target.getAttribute('data-report');
                this.exportReport(reportType);
            }
        });

        // Refresh analytics
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refreshAnalytics') {
                this.loadAnalytics();
            }
        });
    }

    setupSecurityListeners() {
        // View security event details
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-event-btn')) {
                const eventId = e.target.getAttribute('data-event-id');
                this.viewSecurityEvent(eventId);
            }
        });

        // Security settings toggles
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('security-toggle')) {
                const setting = e.target.getAttribute('data-setting');
                this.updateSecuritySetting(setting, e.target.checked);
            }
        });
    }

    setupComplianceListeners() {
        // Generate compliance reports
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('generate-report-btn')) {
                const reportType = e.target.getAttribute('data-report-type');
                this.generateComplianceReport(reportType);
            }
        });

        // Download compliance reports
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-report-btn')) {
                const reportId = e.target.getAttribute('data-report-id');
                this.downloadComplianceReport(reportId);
            }
        });
    }

    setupBillingListeners() {
        // View invoice details
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-invoice-btn')) {
                const invoiceId = e.target.getAttribute('data-invoice-id');
                this.viewInvoice(invoiceId);
            }
        });

        // Billing actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('billing-action-btn')) {
                const action = e.target.getAttribute('data-action');
                const customerId = e.target.getAttribute('data-customer-id');
                this.performBillingAction(action, customerId);
            }
        });
    }

    setupSettingsListeners() {
        // Settings toggles
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('settings-toggle')) {
                const setting = e.target.getAttribute('data-setting');
                this.updateSystemSetting(setting, e.target.checked);
            }
        });

        // Save settings
        document.addEventListener('click', (e) => {
            if (e.target.id === 'saveSettings') {
                this.saveAllSettings();
            }
        });
    }

    async loadInitialData() {
        try {
            await this.loadCustomers();
            await this.loadAnalytics();
            await this.loadSecurityEvents();
            await this.loadComplianceReports();
            await this.loadBillingData();
            await this.loadSystemSettings();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load admin portal data');
        }
    }

    // Customer Management API calls
    async loadCustomers() {
        try {
            const response = await fetch(`${this.baseURL}/customers`);
            const customers = await response.json();
            this.updateCustomerTable(customers);
        } catch (error) {
            console.error('Error loading customers:', error);
            this.showError('Failed to load customers');
        }
    }

    async viewCustomer(customerId) {
        try {
            const response = await fetch(`${this.baseURL}/customers/${customerId}`);
            const customer = await response.json();
            this.showCustomerModal(customer, 'view');
        } catch (error) {
            console.error('Error loading customer:', error);
            this.showError('Failed to load customer details');
        }
    }

    async editCustomer(customerId) {
        try {
            const response = await fetch(`${this.baseURL}/customers/${customerId}`);
            const customer = await response.json();
            this.showCustomerModal(customer, 'edit');
        } catch (error) {
            console.error('Error loading customer for edit:', error);
            this.showError('Failed to load customer for editing');
        }
    }

    async saveCustomerChanges() {
        try {
            const formData = this.getCustomerFormData();
            const response = await fetch(`${this.baseURL}/customers/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showSuccess('Customer updated successfully');
                this.closeModal();
                await this.loadCustomers();
            } else {
                throw new Error('Failed to update customer');
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            this.showError('Failed to save customer changes');
        }
    }

    async searchCustomers(query) {
        try {
            const response = await fetch(`${this.baseURL}/customers/search?q=${encodeURIComponent(query)}`);
            const customers = await response.json();
            this.updateCustomerTable(customers);
        } catch (error) {
            console.error('Error searching customers:', error);
            this.showError('Failed to search customers');
        }
    }

    // Analytics API calls
    async loadAnalytics() {
        try {
            const response = await fetch(`${this.baseURL}/analytics`);
            const analytics = await response.json();
            this.updateAnalyticsDashboard(analytics);
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showError('Failed to load analytics data');
        }
    }

    async exportReport(reportType) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/export/${reportType}`);
            const blob = await response.blob();
            this.downloadFile(blob, `${reportType}-report.csv`);
            this.showSuccess(`${reportType} report exported successfully`);
        } catch (error) {
            console.error('Error exporting report:', error);
            this.showError('Failed to export report');
        }
    }

    // Security API calls
    async loadSecurityEvents() {
        try {
            const response = await fetch(`${this.baseURL}/security/events`);
            const events = await response.json();
            this.updateSecurityEvents(events);
        } catch (error) {
            console.error('Error loading security events:', error);
            this.showError('Failed to load security events');
        }
    }

    async viewSecurityEvent(eventId) {
        try {
            const response = await fetch(`${this.baseURL}/security/events/${eventId}`);
            const event = await response.json();
            this.showSecurityEventModal(event);
        } catch (error) {
            console.error('Error loading security event:', error);
            this.showError('Failed to load security event details');
        }
    }

    async updateSecuritySetting(setting, value) {
        try {
            const response = await fetch(`${this.baseURL}/security/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [setting]: value })
            });

            if (response.ok) {
                this.showSuccess(`Security setting ${setting} updated`);
            } else {
                throw new Error('Failed to update security setting');
            }
        } catch (error) {
            console.error('Error updating security setting:', error);
            this.showError('Failed to update security setting');
        }
    }

    // Compliance API calls
    async loadComplianceReports() {
        try {
            const response = await fetch(`${this.baseURL}/compliance/reports`);
            const reports = await response.json();
            this.updateComplianceReports(reports);
        } catch (error) {
            console.error('Error loading compliance reports:', error);
            this.showError('Failed to load compliance reports');
        }
    }

    async generateComplianceReport(reportType) {
        try {
            const response = await fetch(`${this.baseURL}/compliance/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ report_type: reportType })
            });

            if (response.ok) {
                this.showSuccess(`${reportType} report generation started`);
                await this.loadComplianceReports();
            } else {
                throw new Error('Failed to generate compliance report');
            }
        } catch (error) {
            console.error('Error generating compliance report:', error);
            this.showError('Failed to generate compliance report');
        }
    }

    async downloadComplianceReport(reportId) {
        try {
            const response = await fetch(`${this.baseURL}/compliance/reports/${reportId}/download`);
            const blob = await response.blob();
            this.downloadFile(blob, `compliance-report-${reportId}.pdf`);
            this.showSuccess('Compliance report downloaded successfully');
        } catch (error) {
            console.error('Error downloading compliance report:', error);
            this.showError('Failed to download compliance report');
        }
    }

    // Billing API calls
    async loadBillingData() {
        try {
            const response = await fetch(`${this.baseURL}/billing`);
            const billing = await response.json();
            this.updateBillingDashboard(billing);
        } catch (error) {
            console.error('Error loading billing data:', error);
            this.showError('Failed to load billing data');
        }
    }

    async viewInvoice(invoiceId) {
        try {
            const response = await fetch(`${this.baseURL}/billing/invoices/${invoiceId}`);
            const invoice = await response.json();
            this.showInvoiceModal(invoice);
        } catch (error) {
            console.error('Error loading invoice:', error);
            this.showError('Failed to load invoice details');
        }
    }

    async performBillingAction(action, customerId) {
        try {
            const response = await fetch(`${this.baseURL}/billing/actions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, customer_id: customerId })
            });

            if (response.ok) {
                this.showSuccess(`Billing action ${action} completed`);
                await this.loadBillingData();
            } else {
                throw new Error('Failed to perform billing action');
            }
        } catch (error) {
            console.error('Error performing billing action:', error);
            this.showError('Failed to perform billing action');
        }
    }

    // Settings API calls
    async loadSystemSettings() {
        try {
            const response = await fetch(`${this.baseURL}/settings`);
            const settings = await response.json();
            this.updateSettingsForm(settings);
        } catch (error) {
            console.error('Error loading system settings:', error);
            this.showError('Failed to load system settings');
        }
    }

    async updateSystemSetting(setting, value) {
        try {
            const response = await fetch(`${this.baseURL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [setting]: value })
            });

            if (response.ok) {
                this.showSuccess(`System setting ${setting} updated`);
            } else {
                throw new Error('Failed to update system setting');
            }
        } catch (error) {
            console.error('Error updating system setting:', error);
            this.showError('Failed to update system setting');
        }
    }

    async saveAllSettings() {
        try {
            const settings = this.getAllSettingsFromForm();
            const response = await fetch(`${this.baseURL}/settings/bulk`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showSuccess('All settings saved successfully');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving all settings:', error);
            this.showError('Failed to save settings');
        }
    }

    // UI Update Methods
    updateCustomerTable(customers) {
        const tbody = document.querySelector('#customersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.company}</td>
                <td><span class="status-badge ${customer.status.toLowerCase()}">${customer.status}</span></td>
                <td>${customer.plan}</td>
                <td>$${customer.mrr}</td>
                <td>${new Date(customer.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-customer-btn" data-customer-id="${customer.id}">View</button>
                    <button class="btn btn-sm btn-outline-secondary edit-customer-btn" data-customer-id="${customer.id}">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    updateAnalyticsDashboard(analytics) {
        // Update metrics
        document.getElementById('totalUsers').textContent = analytics.total_users;
        document.getElementById('activeUsers').textContent = analytics.active_users;
        document.getElementById('totalRevenue').textContent = `$${analytics.total_revenue}`;
        document.getElementById('apiCalls').textContent = analytics.api_calls;

        // Update charts (placeholder - would integrate with Chart.js)
        this.updateCharts(analytics.charts);
    }

    updateSecurityEvents(events) {
        const container = document.getElementById('securityEvents');
        if (!container) return;

        container.innerHTML = events.map(event => `
            <div class="security-event-item">
                <div class="event-header">
                    <span class="event-type ${event.severity}">${event.type}</span>
                    <span class="event-time">${new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <div class="event-description">${event.description}</div>
                <button class="btn btn-sm btn-outline-info view-event-btn" data-event-id="${event.id}">View Details</button>
            </div>
        `).join('');
    }

    updateComplianceReports(reports) {
        const container = document.getElementById('complianceReports');
        if (!container) return;

        container.innerHTML = reports.map(report => `
            <div class="compliance-report-item">
                <div class="report-header">
                    <h5>${report.type}</h5>
                    <span class="report-status ${report.status}">${report.status}</span>
                </div>
                <div class="report-details">
                    <p>Generated: ${new Date(report.created_at).toLocaleDateString()}</p>
                    <p>Period: ${report.period}</p>
                </div>
                <button class="btn btn-sm btn-primary download-report-btn" data-report-id="${report.id}">Download</button>
            </div>
        `).join('');
    }

    updateBillingDashboard(billing) {
        document.getElementById('totalRevenue').textContent = `$${billing.total_revenue}`;
        document.getElementById('monthlyRevenue').textContent = `$${billing.monthly_revenue}`;
        document.getElementById('activeSubscriptions').textContent = billing.active_subscriptions;
        document.getElementById('churnRate').textContent = `${billing.churn_rate}%`;
    }

    updateSettingsForm(settings) {
        Object.keys(settings).forEach(key => {
            const element = document.querySelector(`[data-setting="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
            }
        });
    }

    // Modal Methods
    showCustomerModal(customer, mode) {
        const modal = document.getElementById('customerModal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        modalTitle.textContent = mode === 'view' ? 'Customer Details' : 'Edit Customer';
        
        modalBody.innerHTML = `
            <form id="customerForm">
                <input type="hidden" name="id" value="${customer.id}">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-control" name="name" value="${customer.name}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" name="email" value="${customer.email}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Company</label>
                            <input type="text" class="form-control" name="company" value="${customer.company}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Status</label>
                            <select class="form-control" name="status" ${mode === 'view' ? 'disabled' : ''}>
                                <option value="Active" ${customer.status === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Inactive" ${customer.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="Suspended" ${customer.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Plan</label>
                            <input type="text" class="form-control" name="plan" value="${customer.plan}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">MRR</label>
                            <input type="number" class="form-control" name="mrr" value="${customer.mrr}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                    </div>
                </div>
            </form>
        `;

        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = mode === 'edit' ? 
            '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" id="saveCustomerChanges">Save Changes</button>' :
            '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';

        new bootstrap.Modal(modal).show();
    }

    // Utility Methods
    getCustomerFormData() {
        const form = document.getElementById('customerForm');
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    getAllSettingsFromForm() {
        const settings = {};
        document.querySelectorAll('[data-setting]').forEach(element => {
            const setting = element.getAttribute('data-setting');
            settings[setting] = element.type === 'checkbox' ? element.checked : element.value;
        });
        return settings;
    }

    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.style.display = 'none';
        });
        document.getElementById(`${section}Section`).style.display = 'block';

        // Update title
        const titles = {
            customers: 'Customer Management',
            analytics: 'Platform Analytics & Usage Reports',
            security: 'Security Reports & Monitoring',
            compliance: 'SOC2 & HIPAA Compliance Reports',
            billing: 'Billing & Revenue Management',
            settings: 'Platform Settings'
        };
        document.getElementById('sectionTitle').textContent = titles[section];
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        // Add to toast container
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }

        container.appendChild(toast);
        new bootstrap.Toast(toast).show();

        // Remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    showSecurityEventModal(event) {
        const modal = document.getElementById('securityEventModal') || this.createSecurityEventModal();
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        modalTitle.textContent = `Security Event Details - ${event.type}`;
        
        modalBody.innerHTML = `
            <div class="security-event-details">
                <div class="row">
                    <div class="col-md-6">
                        <div class="detail-group">
                            <h5>Event Information</h5>
                            <div class="detail-item">
                                <label>Event ID:</label>
                                <span>${event.id}</span>
                            </div>
                            <div class="detail-item">
                                <label>Type:</label>
                                <span class="event-type ${event.severity}">${event.type}</span>
                            </div>
                            <div class="detail-item">
                                <label>Severity:</label>
                                <span class="severity ${event.severity}">${event.severity}</span>
                            </div>
                            <div class="detail-item">
                                <label>Timestamp:</label>
                                <span>${new Date(event.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="status ${event.status}">${event.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="detail-group">
                            <h5>Source Information</h5>
                            <div class="detail-item">
                                <label>IP Address:</label>
                                <span>${event.source_ip || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>User Agent:</label>
                                <span class="user-agent">${event.user_agent || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Geolocation:</label>
                                <span>${event.geolocation || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>User ID:</label>
                                <span>${event.user_id || 'Anonymous'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h5>Event Description</h5>
                    <div class="event-description">
                        ${event.description || 'No description available'}
                    </div>
                </div>
                
                ${event.details ? `
                <div class="detail-group">
                    <h5>Technical Details</h5>
                    <pre class="technical-details">${JSON.stringify(event.details, null, 2)}</pre>
                </div>
                ` : ''}
                
                ${event.response_actions ? `
                <div class="detail-group">
                    <h5>Response Actions</h5>
                    <ul class="response-actions">
                        ${event.response_actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${event.related_events && event.related_events.length > 0 ? `
                <div class="detail-group">
                    <h5>Related Events</h5>
                    <div class="related-events">
                        ${event.related_events.map(relatedEvent => `
                            <div class="related-event">
                                <span class="event-id">#${relatedEvent.id}</span>
                                <span class="event-type">${relatedEvent.type}</span>
                                <span class="event-time">${new Date(relatedEvent.timestamp).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-warning" onclick="adminPortal.acknowledgeSecurityEvent('${event.id}')">Acknowledge</button>
            <button type="button" class="btn btn-danger" onclick="adminPortal.escalateSecurityEvent('${event.id}')">Escalate</button>
        `;

        new bootstrap.Modal(modal).show();
    }

    createSecurityEventModal() {
        const modal = document.createElement('div');
        modal.id = 'securityEventModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Security Event Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    async acknowledgeSecurityEvent(eventId) {
        try {
            const response = await fetch(`${this.baseURL}/security/events/${eventId}/acknowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                this.showSuccess(`Security event ${eventId} acknowledged`);
                this.closeModal();
                await this.loadSecurityEvents();
            } else {
                throw new Error('Failed to acknowledge security event');
            }
        } catch (error) {
            console.error('Error acknowledging security event:', error);
            this.showError('Failed to acknowledge security event');
        }
    }

    async escalateSecurityEvent(eventId) {
        try {
            const response = await fetch(`${this.baseURL}/security/events/${eventId}/escalate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                this.showSuccess(`Security event ${eventId} escalated`);
                this.closeModal();
                await this.loadSecurityEvents();
            } else {
                throw new Error('Failed to escalate security event');
            }
        } catch (error) {
            console.error('Error escalating security event:', error);
            this.showError('Failed to escalate security event');
        }
    }

    updateCharts(chartData) {
        // Placeholder for chart updates
        // Would integrate with Chart.js or similar library
        console.log('Updating charts with data:', chartData);
    }
}

// Initialize the admin portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPortal = new AdminPortalAPI();
});