/**
 * SKU-Genie Store Demo - Reports
 * 
 * This file handles the reporting functionality for the HTML store.
 * It integrates with the platform-agnostic reporting module.
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const reportTemplate = document.getElementById('reportTemplate');
    const savedConfig = document.getElementById('savedConfig');
    const addFilterBtn = document.getElementById('addFilterBtn');
    const filtersContainer = document.getElementById('filtersContainer');
    const noFiltersMsg = document.getElementById('noFiltersMsg');
    const groupBy = document.getElementById('groupBy');
    const sortBy = document.getElementById('sortBy');
    const sortOrder = document.getElementById('sortOrder');
    const sortOrderContainer = document.getElementById('sortOrderContainer');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const refreshReportBtn = document.getElementById('refreshReportBtn');
    const reportResults = document.getElementById('reportResults');
    const chartContainer = document.getElementById('chartContainer');
    const reportChart = document.getElementById('reportChart');
    const saveConfigModal = new bootstrap.Modal(document.getElementById('saveConfigModal'));
    const configName = document.getElementById('configName');
    const configDescription = document.getElementById('configDescription');
    const saveConfigConfirmBtn = document.getElementById('saveConfigConfirmBtn');
    const builderTab = document.getElementById('builder-tab');
    const resultsTab = document.getElementById('results-tab');
    
    // State
    let filters = [];
    let visualization = 'table';
    let reportData = null;
    let chart = null;
    
    // API Configuration
    const API_URL = 'https://api.eyewearml.com/v1';
    const API_KEY = 'process.env.API_KEY_233'; // Replace with actual API key in production
    
    // Initialize
    init();
    
    /**
     * Initialize the report builder
     */
    function init() {
        // Set up event listeners
        addFilterBtn.addEventListener('click', addFilter);
        saveConfigBtn.addEventListener('click', openSaveConfigModal);
        saveConfigConfirmBtn.addEventListener('click', saveConfiguration);
        generateReportBtn.addEventListener('click', generateReport);
        refreshReportBtn.addEventListener('click', generateReport);
        reportTemplate.addEventListener('change', handleTemplateChange);
        savedConfig.addEventListener('change', handleConfigurationChange);
        sortBy.addEventListener('change', handleSortByChange);
        
        // Set up visualization radio buttons
        document.querySelectorAll('input[name="visualization"]').forEach(radio => {
            radio.addEventListener('change', function() {
                visualization = this.value;
            });
        });
        
        // Fetch report templates and configurations
        fetchReportTemplates();
        fetchReportConfigurations();
    }
    
    /**
     * Fetch report templates from the API
     */
    function fetchReportTemplates() {
        // In a real implementation, this would fetch from the API
        // For demo purposes, we'll use hardcoded data
        const templates = [
            { id: 'products', name: 'Products Report', dataSource: 'HtmlStore' },
            { id: 'sales', name: 'Sales Report', dataSource: 'HtmlStore' },
            { id: 'customers', name: 'Customers Report', dataSource: 'HtmlStore' }
        ];
        
        // Clear existing options except the first one
        while (reportTemplate.options.length > 1) {
            reportTemplate.remove(1);
        }
        
        // Add new options
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            reportTemplate.appendChild(option);
        });
    }
    
    /**
     * Fetch report configurations from the API
     */
    function fetchReportConfigurations() {
        // In a real implementation, this would fetch from the API
        // For demo purposes, we'll use hardcoded data
        const configurations = [
            { id: 'config1', name: 'Monthly Sales', reportTemplateId: 'sales' },
            { id: 'config2', name: 'Top Products', reportTemplateId: 'products' },
            { id: 'config3', name: 'Customer Insights', reportTemplateId: 'customers' }
        ];
        
        // Clear existing options except the first one
        while (savedConfig.options.length > 1) {
            savedConfig.remove(1);
        }
        
        // Add new options
        configurations.forEach(config => {
            const option = document.createElement('option');
            option.value = config.id;
            option.textContent = config.name;
            savedConfig.appendChild(option);
        });
    }
    
    /**
     * Handle template selection
     */
    function handleTemplateChange() {
        const templateId = reportTemplate.value;
        
        if (!templateId) {
            return;
        }
        
        // Reset customization options
        resetCustomizationOptions();
        
        // In a real implementation, this would fetch template details from the API
        // and set default customization options
    }
    
    /**
     * Handle configuration selection
     */
    function handleConfigurationChange() {
        const configId = savedConfig.value;
        
        if (!configId) {
            return;
        }
        
        // In a real implementation, this would fetch configuration details from the API
        // For demo purposes, we'll use hardcoded data
        const configurations = {
            'config1': {
                reportTemplateId: 'sales',
                filters: [
                    { field: 'date', operator: '>=', value: '2025-01-01' }
                ],
                grouping: 'month',
                sorting: { field: 'amount', order: 'desc' },
                visualization: 'bar'
            },
            'config2': {
                reportTemplateId: 'products',
                filters: [
                    { field: 'stock', operator: '>', value: '0' }
                ],
                grouping: 'category',
                sorting: { field: 'sales', order: 'desc' },
                visualization: 'pie'
            },
            'config3': {
                reportTemplateId: 'customers',
                filters: [
                    { field: 'orders', operator: '>=', value: '3' }
                ],
                grouping: null,
                sorting: { field: 'name', order: 'asc' },
                visualization: 'table'
            }
        };
        
        const config = configurations[configId];
        
        if (config) {
            // Set report template
            reportTemplate.value = config.reportTemplateId;
            
            // Reset customization options
            resetCustomizationOptions();
            
            // Set filters
            if (config.filters && config.filters.length > 0) {
                filters = [...config.filters];
                renderFilters();
            }
            
            // Set grouping
            if (config.grouping) {
                groupBy.value = config.grouping;
            }
            
            // Set sorting
            if (config.sorting) {
                sortBy.value = config.sorting.field;
                sortOrder.value = config.sorting.order;
                sortOrderContainer.style.display = 'block';
            }
            
            // Set visualization
            if (config.visualization) {
                document.querySelector(`input[name="visualization"][value="${config.visualization}"]`).checked = true;
                visualization = config.visualization;
            }
        }
    }
    
    /**
     * Handle sort by change
     */
    function handleSortByChange() {
        if (sortBy.value) {
            sortOrderContainer.style.display = 'block';
        } else {
            sortOrderContainer.style.display = 'none';
        }
    }
    
    /**
     * Reset customization options
     */
    function resetCustomizationOptions() {
        // Reset filters
        filters = [];
        renderFilters();
        
        // Reset grouping
        groupBy.value = '';
        
        // Reset sorting
        sortBy.value = '';
        sortOrder.value = 'asc';
        sortOrderContainer.style.display = 'none';
        
        // Reset visualization
        document.querySelector('input[name="visualization"][value="table"]').checked = true;
        visualization = 'table';
    }
    
    /**
     * Add a new filter
     */
    function addFilter() {
        filters.push({ field: '', operator: '=', value: '' });
        renderFilters();
    }
    
    /**
     * Remove a filter
     */
    function removeFilter(index) {
        filters.splice(index, 1);
        renderFilters();
    }
    
    /**
     * Update a filter
     */
    function updateFilter(index, field, value) {
        filters[index][field] = value;
    }
    
    /**
     * Render filters
     */
    function renderFilters() {
        // Clear existing filters
        while (filtersContainer.firstChild) {
            filtersContainer.removeChild(filtersContainer.firstChild);
        }
        
        // Show/hide no filters message
        if (filters.length === 0) {
            noFiltersMsg.style.display = 'block';
            filtersContainer.appendChild(noFiltersMsg);
            return;
        } else {
            noFiltersMsg.style.display = 'none';
        }
        
        // Render each filter
        filters.forEach((filter, index) => {
            const filterRow = document.createElement('div');
            filterRow.className = 'filter-row';
            
            // Field input
            const fieldInput = document.createElement('input');
            fieldInput.type = 'text';
            fieldInput.className = 'form-control';
            fieldInput.placeholder = 'Field';
            fieldInput.value = filter.field;
            fieldInput.addEventListener('change', function() {
                updateFilter(index, 'field', this.value);
            });
            
            // Operator select
            const operatorSelect = document.createElement('select');
            operatorSelect.className = 'form-select';
            
            const operators = [
                { value: '=', label: '=' },
                { value: '!=', label: '!=' },
                { value: '>', label: '>' },
                { value: '<', label: '<' },
                { value: '>=', label: '>=' },
                { value: '<=', label: '<=' }
            ];
            
            operators.forEach(op => {
                const option = document.createElement('option');
                option.value = op.value;
                option.textContent = op.label;
                operatorSelect.appendChild(option);
            });
            
            operatorSelect.value = filter.operator;
            operatorSelect.addEventListener('change', function() {
                updateFilter(index, 'operator', this.value);
            });
            
            // Value input
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'form-control';
            valueInput.placeholder = 'Value';
            valueInput.value = filter.value;
            valueInput.addEventListener('change', function() {
                updateFilter(index, 'value', this.value);
            });
            
            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger';
            removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
            removeBtn.addEventListener('click', function() {
                removeFilter(index);
            });
            
            // Add elements to filter row
            filterRow.appendChild(fieldInput);
            filterRow.appendChild(operatorSelect);
            filterRow.appendChild(valueInput);
            filterRow.appendChild(removeBtn);
            
            // Add filter row to container
            filtersContainer.appendChild(filterRow);
        });
    }
    
    /**
     * Open save configuration modal
     */
    function openSaveConfigModal() {
        configName.value = '';
        configDescription.value = '';
        saveConfigModal.show();
    }
    
    /**
     * Save report configuration
     */
    function saveConfiguration() {
        if (!configName.value) {
            alert('Please enter a name for the configuration');
            return;
        }
        
        const config = {
            name: configName.value,
            description: configDescription.value,
            reportTemplateId: reportTemplate.value,
            filters: filters,
            grouping: groupBy.value || null,
            sorting: sortBy.value ? { field: sortBy.value, order: sortOrder.value } : null,
            visualization: visualization
        };
        
        // In a real implementation, this would save to the API
        console.log('Saving configuration:', config);
        
        // Close modal
        saveConfigModal.hide();
        
        // Show success message
        alert('Configuration saved successfully!');
        
        // Refresh configurations
        fetchReportConfigurations();
    }
    
    /**
     * Generate report
     */
    function generateReport() {
        if (!reportTemplate.value) {
            alert('Please select a report template');
            return;
        }
        
        // Show loading indicator
        reportResults.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Switch to results tab
        const resultsTabInstance = new bootstrap.Tab(resultsTab);
        resultsTabInstance.show();
        
        // Get report configuration
        const reportConfig = {
            reportTemplateId: reportTemplate.value,
            filters: filters,
            grouping: groupBy.value || null,
            sorting: sortBy.value ? { field: sortBy.value, order: sortOrder.value } : null,
            visualization: visualization
        };
        
        // In a real implementation, this would fetch from the API
        // For demo purposes, we'll use hardcoded data
        setTimeout(() => {
            // Sample data for demonstration
            reportData = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                datasets: [
                    {
                        label: 'Sales',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            };
            
            renderReport();
        }, 1000);
    }
    
    /**
     * Render report
     */
    function renderReport() {
        if (!reportData) {
            reportResults.innerHTML = '<p class="text-center text-muted">No report data available. Generate a report to see results.</p>';
            chartContainer.style.display = 'none';
            return;
        }
        
        // Render based on visualization type
        switch (visualization) {
            case 'bar':
            case 'line':
            case 'pie':
                renderChart();
                break;
            case 'table':
            default:
                renderTable();
                break;
        }
    }
    
    /**
     * Render chart
     */
    function renderChart() {
        // Clear previous chart
        if (chart) {
            chart.destroy();
        }
        
        // Show chart container
        chartContainer.style.display = 'block';
        reportResults.innerHTML = '';
        
        // Create chart
        chart = new Chart(reportChart, {
            type: visualization,
            data: reportData,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    /**
     * Render table
     */
    function renderTable() {
        // Hide chart container
        chartContainer.style.display = 'none';
        
        // Create table
        let tableHtml = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Sales</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add rows
        reportData.labels.forEach((label, index) => {
            tableHtml += `
                <tr>
                    <td>${label}</td>
                    <td>${reportData.datasets[0].data[index]}</td>
                </tr>
            `;
        });
        
        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Set table HTML
        reportResults.innerHTML = tableHtml;
    }
});
