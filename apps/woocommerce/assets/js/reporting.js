/**
 * EyewearML Reporting JavaScript
 * 
 * This file handles the reporting functionality for the WooCommerce plugin.
 * It integrates with the platform-agnostic reporting module.
 */

(function($, React, ReactDOM, Chart) {
    'use strict';

    // Make sure we have all dependencies
    if (!$ || !React || !ReactDOM || !Chart) {
        console.error('EyewearML Reporting: Missing dependencies');
        return;
    }

    // Make sure we have the reporting data
    if (!window.eyewearml_reporting) {
        console.error('EyewearML Reporting: Missing reporting data');
        return;
    }

    // ReportBuilder component
    const ReportBuilder = () => {
        const [activeTab, setActiveTab] = React.useState('builder');
        const [reportTemplates, setReportTemplates] = React.useState([]);
        const [selectedTemplate, setSelectedTemplate] = React.useState('');
        const [reportConfigurations, setReportConfigurations] = React.useState([]);
        const [selectedConfiguration, setSelectedConfiguration] = React.useState('');
        const [filters, setFilters] = React.useState([]);
        const [grouping, setGrouping] = React.useState(null);
        const [sorting, setSorting] = React.useState(null);
        const [visualization, setVisualization] = React.useState('table');
        const [reportData, setReportData] = React.useState(null);
        const [isLoading, setIsLoading] = React.useState(false);
        const [error, setError] = React.useState(null);
        const [reportName, setReportName] = React.useState('');
        const [reportDescription, setReportDescription] = React.useState('');
        const [showSaveDialog, setShowSaveDialog] = React.useState(false);

        // Fetch report templates on component mount
        React.useEffect(() => {
            fetchReportTemplates();
            fetchReportConfigurations();
        }, []);

        // Fetch report templates
        const fetchReportTemplates = () => {
            setIsLoading(true);
            setError(null);

            $.ajax({
                url: eyewearml_reporting.ajax_url,
                type: 'POST',
                data: {
                    action: 'eyewearml_get_report_templates',
                    nonce: eyewearml_reporting.nonce
                },
                success: function(response) {
                    if (response.success) {
                        setReportTemplates(response.data);
                    } else {
                        setError(response.data || 'Error fetching report templates');
                    }
                    setIsLoading(false);
                },
                error: function(xhr, status, error) {
                    setError('Error fetching report templates: ' + error);
                    setIsLoading(false);
                }
            });
        };

        // Fetch report configurations
        const fetchReportConfigurations = () => {
            setIsLoading(true);
            setError(null);

            $.ajax({
                url: eyewearml_reporting.ajax_url,
                type: 'POST',
                data: {
                    action: 'eyewearml_get_report_configurations',
                    nonce: eyewearml_reporting.nonce
                },
                success: function(response) {
                    if (response.success) {
                        setReportConfigurations(response.data);
                    } else {
                        setError(response.data || 'Error fetching report configurations');
                    }
                    setIsLoading(false);
                },
                error: function(xhr, status, error) {
                    setError('Error fetching report configurations: ' + error);
                    setIsLoading(false);
                }
            });
        };

        // Handle template selection
        const handleTemplateChange = (e) => {
            const templateId = e.target.value;
            setSelectedTemplate(templateId);

            // Find the selected template
            const template = reportTemplates.find(t => t.id === templateId);

            // Reset customization options
            setFilters([]);
            setGrouping(null);
            setSorting(null);
            setVisualization('table');

            // Set default customization options based on template
            if (template && template.customizationOptions) {
                if (template.customizationOptions.defaultFilters) {
                    setFilters(template.customizationOptions.defaultFilters);
                }

                if (template.customizationOptions.defaultGrouping) {
                    setGrouping(template.customizationOptions.defaultGrouping);
                }

                if (template.customizationOptions.defaultSorting) {
                    setSorting(template.customizationOptions.defaultSorting);
                }

                if (template.customizationOptions.defaultVisualization) {
                    setVisualization(template.customizationOptions.defaultVisualization);
                }
            }
        };

        // Handle configuration selection
        const handleConfigurationChange = (e) => {
            const configId = e.target.value;
            setSelectedConfiguration(configId);

            if (configId === '') {
                return;
            }

            // Find the selected configuration
            const config = reportConfigurations.find(c => c.id === configId);

            if (config) {
                setSelectedTemplate(config.reportTemplateId);
                setFilters(config.filters || []);
                setGrouping(config.grouping || null);
                setSorting(config.sorting || null);
                setVisualization(config.visualization || 'table');
                setReportName(config.name);
                setReportDescription(config.description || '');
            }
        };

        // Handle adding a filter
        const handleAddFilter = () => {
            setFilters([...filters, { field: '', operator: '=', value: '' }]);
        };

        // Handle removing a filter
        const handleRemoveFilter = (index) => {
            const newFilters = [...filters];
            newFilters.splice(index, 1);
            setFilters(newFilters);
        };

        // Handle filter change
        const handleFilterChange = (index, field, value) => {
            const newFilters = [...filters];
            newFilters[index][field] = value;
            setFilters(newFilters);
        };

        // Handle generate report
        const handleGenerateReport = () => {
            setIsLoading(true);
            setError(null);

            const reportConfig = {
                reportTemplateId: selectedTemplate,
                filters,
                grouping,
                sorting,
                visualization
            };

            $.ajax({
                url: eyewearml_reporting.ajax_url,
                type: 'POST',
                data: {
                    action: 'eyewearml_get_report_data',
                    nonce: eyewearml_reporting.nonce,
                    report_config: JSON.stringify(reportConfig)
                },
                success: function(response) {
                    if (response.success) {
                        setReportData(response.data);
                        setActiveTab('results');
                    } else {
                        setError(response.data || 'Error generating report');
                    }
                    setIsLoading(false);
                },
                error: function(xhr, status, error) {
                    setError('Error generating report: ' + error);
                    setIsLoading(false);
                }
            });
        };

        // Handle save configuration
        const handleSaveConfiguration = () => {
            if (!reportName) {
                setError('Report name is required');
                return;
            }

            setIsLoading(true);
            setError(null);

            const reportConfig = {
                name: reportName,
                description: reportDescription,
                reportTemplateId: selectedTemplate,
                filters,
                grouping,
                sorting,
                visualization
            };

            $.ajax({
                url: eyewearml_reporting.ajax_url,
                type: 'POST',
                data: {
                    action: 'eyewearml_save_report_config',
                    nonce: eyewearml_reporting.nonce,
                    report_config: JSON.stringify(reportConfig)
                },
                success: function(response) {
                    if (response.success) {
                        setShowSaveDialog(false);
                        fetchReportConfigurations();
                    } else {
                        setError(response.data || 'Error saving report configuration');
                    }
                    setIsLoading(false);
                },
                error: function(xhr, status, error) {
                    setError('Error saving report configuration: ' + error);
                    setIsLoading(false);
                }
            });
        };

        // Render visualization
        const renderVisualization = () => {
            if (!reportData) {
                return React.createElement('div', { className: 'eyewearml-no-data' },
                    React.createElement('p', null, 'No report data available. Generate a report to see results.')
                );
            }

            // Sample data for demonstration
            const chartData = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                datasets: [
                    {
                        label: 'Sales',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            };

            // Render based on visualization type
            switch (visualization) {
                case 'bar':
                    // Render bar chart
                    return React.createElement('div', { className: 'eyewearml-chart-container' },
                        React.createElement('canvas', { id: 'eyewearml-chart', ref: (el) => {
                            if (el) {
                                new Chart(el, {
                                    type: 'bar',
                                    data: chartData,
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false
                                    }
                                });
                            }
                        }})
                    );
                case 'line':
                    // Render line chart
                    return React.createElement('div', { className: 'eyewearml-chart-container' },
                        React.createElement('canvas', { id: 'eyewearml-chart', ref: (el) => {
                            if (el) {
                                new Chart(el, {
                                    type: 'line',
                                    data: chartData,
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false
                                    }
                                });
                            }
                        }})
                    );
                case 'pie':
                    // Render pie chart
                    return React.createElement('div', { className: 'eyewearml-chart-container' },
                        React.createElement('canvas', { id: 'eyewearml-chart', ref: (el) => {
                            if (el) {
                                new Chart(el, {
                                    type: 'pie',
                                    data: chartData,
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false
                                    }
                                });
                            }
                        }})
                    );
                case 'table':
                default:
                    // Render table
                    return React.createElement('div', { className: 'eyewearml-table-container' },
                        React.createElement('table', { className: 'wp-list-table widefat fixed striped' },
                            React.createElement('thead', null,
                                React.createElement('tr', null,
                                    React.createElement('th', null, 'Month'),
                                    React.createElement('th', null, 'Sales')
                                )
                            ),
                            React.createElement('tbody', null,
                                chartData.labels.map((month, index) => {
                                    return React.createElement('tr', { key: month },
                                        React.createElement('td', null, month),
                                        React.createElement('td', null, chartData.datasets[0].data[index])
                                    );
                                })
                            )
                        )
                    );
            }
        };

        // Render save dialog
        const renderSaveDialog = () => {
            if (!showSaveDialog) {
                return null;
            }

            return React.createElement('div', { className: 'eyewearml-modal' },
                React.createElement('div', { className: 'eyewearml-modal-content' },
                    React.createElement('h2', null, 'Save Report Configuration'),
                    React.createElement('div', { className: 'eyewearml-form-group' },
                        React.createElement('label', { htmlFor: 'report-name' }, 'Report Name'),
                        React.createElement('input', {
                            type: 'text',
                            id: 'report-name',
                            value: reportName,
                            onChange: (e) => setReportName(e.target.value)
                        })
                    ),
                    React.createElement('div', { className: 'eyewearml-form-group' },
                        React.createElement('label', { htmlFor: 'report-description' }, 'Description'),
                        React.createElement('textarea', {
                            id: 'report-description',
                            value: reportDescription,
                            onChange: (e) => setReportDescription(e.target.value)
                        })
                    ),
                    React.createElement('div', { className: 'eyewearml-form-actions' },
                        React.createElement('button', {
                            className: 'button button-secondary',
                            onClick: () => setShowSaveDialog(false)
                        }, 'Cancel'),
                        React.createElement('button', {
                            className: 'button button-primary',
                            onClick: handleSaveConfiguration
                        }, 'Save')
                    )
                )
            );
        };

        // Render component
        return React.createElement('div', { className: 'eyewearml-report-builder' },
            // Tabs
            React.createElement('div', { className: 'nav-tab-wrapper' },
                React.createElement('a', {
                    className: `nav-tab ${activeTab === 'builder' ? 'nav-tab-active' : ''}`,
                    onClick: () => setActiveTab('builder')
                }, 'Builder'),
                React.createElement('a', {
                    className: `nav-tab ${activeTab === 'results' ? 'nav-tab-active' : ''}`,
                    onClick: () => setActiveTab('results')
                }, 'Results')
            ),

            // Error message
            error && React.createElement('div', { className: 'notice notice-error' },
                React.createElement('p', null, error)
            ),

            // Loading indicator
            isLoading && React.createElement('div', { className: 'eyewearml-loading' },
                React.createElement('span', { className: 'spinner is-active' })
            ),

            // Builder tab
            activeTab === 'builder' && React.createElement('div', { className: 'eyewearml-tab-content' },
                // Report configuration
                React.createElement('div', { className: 'postbox' },
                    React.createElement('h2', { className: 'hndle' }, 'Report Configuration'),
                    React.createElement('div', { className: 'inside' },
                        React.createElement('div', { className: 'eyewearml-form-row' },
                            React.createElement('div', { className: 'eyewearml-form-col' },
                                React.createElement('label', { htmlFor: 'report-template' }, 'Report Template'),
                                React.createElement('select', {
                                    id: 'report-template',
                                    value: selectedTemplate,
                                    onChange: handleTemplateChange
                                },
                                    React.createElement('option', { value: '' }, 'Select a template'),
                                    reportTemplates.map(template => {
                                        return React.createElement('option', {
                                            key: template.id,
                                            value: template.id
                                        }, template.name);
                                    })
                                )
                            ),
                            React.createElement('div', { className: 'eyewearml-form-col' },
                                React.createElement('label', { htmlFor: 'report-configuration' }, 'Saved Configurations'),
                                React.createElement('select', {
                                    id: 'report-configuration',
                                    value: selectedConfiguration,
                                    onChange: handleConfigurationChange
                                },
                                    React.createElement('option', { value: '' }, 'Select a configuration'),
                                    reportConfigurations.map(config => {
                                        return React.createElement('option', {
                                            key: config.id,
                                            value: config.id
                                        }, config.name);
                                    })
                                )
                            )
                        )
                    )
                ),

                // Filters
                selectedTemplate && React.createElement('div', { className: 'postbox' },
                    React.createElement('h2', { className: 'hndle' }, 'Filters'),
                    React.createElement('div', { className: 'inside' },
                        React.createElement('button', {
                            className: 'button',
                            onClick: handleAddFilter
                        }, 'Add Filter'),
                        filters.length === 0 ?
                            React.createElement('p', { className: 'description' }, 'No filters applied. Click "Add Filter" to add a filter.') :
                            filters.map((filter, index) => {
                                return React.createElement('div', { key: index, className: 'eyewearml-filter-row' },
                                    React.createElement('input', {
                                        type: 'text',
                                        placeholder: 'Field',
                                        value: filter.field,
                                        onChange: (e) => handleFilterChange(index, 'field', e.target.value)
                                    }),
                                    React.createElement('select', {
                                        value: filter.operator,
                                        onChange: (e) => handleFilterChange(index, 'operator', e.target.value)
                                    },
                                        React.createElement('option', { value: '=' }, '='),
                                        React.createElement('option', { value: '!=' }, '!='),
                                        React.createElement('option', { value: '>' }, '>'),
                                        React.createElement('option', { value: '<' }, '<'),
                                        React.createElement('option', { value: '>=' }, '>='),
                                        React.createElement('option', { value: '<=' }, '<=')
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        placeholder: 'Value',
                                        value: filter.value,
                                        onChange: (e) => handleFilterChange(index, 'value', e.target.value)
                                    }),
                                    React.createElement('button', {
                                        className: 'button',
                                        onClick: () => handleRemoveFilter(index)
                                    }, 'Remove')
                                );
                            })
                    )
                ),

                // Actions
                selectedTemplate && React.createElement('div', { className: 'eyewearml-actions' },
                    React.createElement('button', {
                        className: 'button button-secondary',
                        onClick: () => setShowSaveDialog(true)
                    }, 'Save Configuration'),
                    React.createElement('button', {
                        className: 'button button-primary',
                        onClick: handleGenerateReport
                    }, 'Generate Report')
                )
            ),

            // Results tab
            activeTab === 'results' && React.createElement('div', { className: 'eyewearml-tab-content' },
                React.createElement('div', { className: 'postbox' },
                    React.createElement('h2', { className: 'hndle' }, 'Report Results'),
                    React.createElement('div', { className: 'inside' },
                        renderVisualization()
                    )
                )
            ),

            // Save dialog
            renderSaveDialog()
        );
    };

    // Initialize when DOM is ready
    $(document).ready(function() {
        const container = document.getElementById('eyewearml-report-builder');
        if (container) {
            ReactDOM.render(React.createElement(ReportBuilder), container);
        }
    });

})(jQuery, window.React, window.ReactDOM, window.Chart);