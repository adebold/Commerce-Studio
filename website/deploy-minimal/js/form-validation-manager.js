/**
 * Form Validation Manager for Customer Portal
 * Provides comprehensive form validation with real-time feedback
 * Part of US-003: Form Validation Enhancement
 */

class FormValidationManager {
    constructor() {
        this.validators = new Map();
        this.validationRules = new Map();
        this.errorMessages = new Map();
        this.validatedForms = new Set();
        this.realTimeValidation = true;
        this.debounceTimeout = 300;
        this.debounceTimers = new Map();
        
        this.initializeDefaultRules();
        this.initializeDefaultMessages();
    }

    /**
     * Initialize default validation rules
     */
    initializeDefaultRules() {
        // Email validation
        this.addRule('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });

        // Phone validation
        this.addRule('phone', (value) => {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        });

        // Required field validation
        this.addRule('required', (value) => {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        });

        // Minimum length validation
        this.addRule('minLength', (value, minLength) => {
            return value && value.length >= minLength;
        });

        // Maximum length validation
        this.addRule('maxLength', (value, maxLength) => {
            return !value || value.length <= maxLength;
        });

        // Numeric validation
        this.addRule('numeric', (value) => {
            return !isNaN(value) && !isNaN(parseFloat(value));
        });

        // ZIP code validation
        this.addRule('zipCode', (value) => {
            const zipRegex = /^\d{5}(-\d{4})?$/;
            return zipRegex.test(value);
        });

        // Credit card validation (Luhn algorithm)
        this.addRule('creditCard', (value) => {
            const cleanValue = value.replace(/\s/g, '');
            if (!/^\d+$/.test(cleanValue)) return false;
            
            let sum = 0;
            let isEven = false;
            
            for (let i = cleanValue.length - 1; i >= 0; i--) {
                let digit = parseInt(cleanValue.charAt(i), 10);
                
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                
                sum += digit;
                isEven = !isEven;
            }
            
            return sum % 10 === 0;
        });

        // Password strength validation
        this.addRule('passwordStrength', (value) => {
            if (!value || value.length < 8) return false;
            
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumbers = /\d/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            
            return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
        });

        // URL validation
        this.addRule('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });

        // Date validation
        this.addRule('date', (value) => {
            const date = new Date(value);
            return date instanceof Date && !isNaN(date);
        });
    }

    /**
     * Initialize default error messages
     */
    initializeDefaultMessages() {
        this.errorMessages.set('email', 'Please enter a valid email address');
        this.errorMessages.set('phone', 'Please enter a valid phone number');
        this.errorMessages.set('required', 'This field is required');
        this.errorMessages.set('minLength', 'Must be at least {min} characters long');
        this.errorMessages.set('maxLength', 'Must be no more than {max} characters long');
        this.errorMessages.set('numeric', 'Please enter a valid number');
        this.errorMessages.set('zipCode', 'Please enter a valid ZIP code');
        this.errorMessages.set('creditCard', 'Please enter a valid credit card number');
        this.errorMessages.set('passwordStrength', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        this.errorMessages.set('url', 'Please enter a valid URL');
        this.errorMessages.set('date', 'Please enter a valid date');
    }

    /**
     * Add a custom validation rule
     */
    addRule(name, validator) {
        this.validationRules.set(name, validator);
    }

    /**
     * Add a custom error message
     */
    addErrorMessage(rule, message) {
        this.errorMessages.set(rule, message);
    }

    /**
     * Initialize form validation
     */
    init() {
        console.log('🔍 Initializing Form Validation Manager...');
        
        // Find all forms with validation attributes
        const forms = document.querySelectorAll('form[data-validate], .settings-form');
        
        forms.forEach(form => this.setupFormValidation(form));
        
        // Setup real-time validation for individual fields
        this.setupFieldValidation();
        
        console.log(`✅ Form Validation Manager initialized for ${forms.length} forms`);
    }

    /**
     * Setup validation for a specific form
     */
    setupFormValidation(form) {
        if (this.validatedForms.has(form)) return;
        
        this.validatedForms.add(form);
        
        // Add form validation on submit
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                e.stopPropagation();
                this.showFormErrors(form);
            }
        });

        // Add novalidate to prevent browser validation
        form.setAttribute('novalidate', 'true');
        
        console.log('📝 Setup validation for form:', form.id || 'unnamed');
    }

    /**
     * Setup real-time field validation
     */
    setupFieldValidation() {
        // Find all input fields with validation attributes
        const fields = document.querySelectorAll('input[data-validate], select[data-validate], textarea[data-validate]');
        
        fields.forEach(field => {
            // Real-time validation on input
            field.addEventListener('input', (e) => {
                if (this.realTimeValidation) {
                    this.debounceValidation(field);
                }
            });

            // Validation on blur
            field.addEventListener('blur', (e) => {
                this.validateField(field, true);
            });

            // Clear validation on focus
            field.addEventListener('focus', (e) => {
                this.clearFieldError(field);
            });
        });

        console.log(`🎯 Setup real-time validation for ${fields.length} fields`);
    }

    /**
     * Debounced validation to avoid excessive validation calls
     */
    debounceValidation(field) {
        const fieldId = field.id || field.name || 'unnamed';
        
        // Clear existing timer
        if (this.debounceTimers.has(fieldId)) {
            clearTimeout(this.debounceTimers.get(fieldId));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            this.validateField(field, false);
            this.debounceTimers.delete(fieldId);
        }, this.debounceTimeout);
        
        this.debounceTimers.set(fieldId, timer);
    }

    /**
     * Validate a single field
     */
    validateField(field, showError = true) {
        const value = field.value;
        const rules = this.getFieldRules(field);
        const errors = [];

        // Validate each rule
        for (const rule of rules) {
            const isValid = this.applyRule(rule, value);
            if (!isValid) {
                errors.push(this.getErrorMessage(rule, field));
            }
        }

        // Update field state
        if (errors.length > 0) {
            if (showError) {
                this.showFieldError(field, errors[0]);
            }
            return false;
        } else {
            this.showFieldSuccess(field);
            return true;
        }
    }

    /**
     * Get validation rules for a field
     */
    getFieldRules(field) {
        const rules = [];
        const validateAttr = field.getAttribute('data-validate');
        
        if (validateAttr) {
            const ruleStrings = validateAttr.split('|');
            
            for (const ruleString of ruleStrings) {
                const [ruleName, ...params] = ruleString.split(':');
                rules.push({
                    name: ruleName.trim(),
                    params: params.length > 0 ? params[0].split(',').map(p => p.trim()) : []
                });
            }
        }

        // Add implicit rules based on field attributes
        if (field.hasAttribute('required')) {
            rules.unshift({ name: 'required', params: [] });
        }

        if (field.type === 'email') {
            rules.push({ name: 'email', params: [] });
        }

        if (field.type === 'tel') {
            rules.push({ name: 'phone', params: [] });
        }

        if (field.type === 'url') {
            rules.push({ name: 'url', params: [] });
        }

        if (field.type === 'date') {
            rules.push({ name: 'date', params: [] });
        }

        if (field.type === 'number') {
            rules.push({ name: 'numeric', params: [] });
        }

        return rules;
    }

    /**
     * Apply a validation rule
     */
    applyRule(rule, value) {
        const validator = this.validationRules.get(rule.name);
        if (!validator) {
            console.warn(`Unknown validation rule: ${rule.name}`);
            return true;
        }

        try {
            return validator(value, ...rule.params);
        } catch (error) {
            console.error(`Error applying validation rule ${rule.name}:`, error);
            return false;
        }
    }

    /**
     * Get error message for a rule
     */
    getErrorMessage(rule, field) {
        let message = this.errorMessages.get(rule.name) || `Invalid ${rule.name}`;
        
        // Replace placeholders
        if (rule.params.length > 0) {
            message = message.replace('{min}', rule.params[0]);
            message = message.replace('{max}', rule.params[0]);
        }

        // Use custom message from field if available
        const customMessage = field.getAttribute(`data-${rule.name}-message`);
        if (customMessage) {
            message = customMessage;
        }

        return message;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('validation-error');
        field.classList.remove('validation-success');
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'validation-error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        
        // Insert error message after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Update ARIA attributes
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorElement.id = `error-${field.id || Date.now()}`);
    }

    /**
     * Show field success
     */
    showFieldSuccess(field) {
        this.clearFieldError(field);
        
        // Add success class
        field.classList.add('validation-success');
        field.classList.remove('validation-error');
        
        // Update ARIA attributes
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        // Remove error classes
        field.classList.remove('validation-error', 'validation-success');
        
        // Remove error message
        const errorElement = field.parentNode.querySelector('.validation-error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Clear ARIA attributes
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }

    /**
     * Validate entire form
     */
    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            const fieldValid = this.validateField(field, true);
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Show form-level errors
     */
    showFormErrors(form) {
        const firstErrorField = form.querySelector('.validation-error');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Show toast notification
        this.showToast('Please correct the errors below', 'error');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `validation-toast validation-toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        
        // Add to page
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Add validation to specific field
     */
    addFieldValidation(fieldSelector, rules, customMessages = {}) {
        const field = document.querySelector(fieldSelector);
        if (!field) {
            console.warn(`Field not found: ${fieldSelector}`);
            return;
        }
        
        // Set validation attribute
        field.setAttribute('data-validate', rules);
        
        // Add custom messages
        Object.entries(customMessages).forEach(([rule, message]) => {
            field.setAttribute(`data-${rule}-message`, message);
        });
        
        // Setup validation if not already done
        if (!this.validatedForms.has(field.form)) {
            this.setupFormValidation(field.form);
        }
        
        this.setupFieldValidation();
    }

    /**
     * Remove validation from field
     */
    removeFieldValidation(fieldSelector) {
        const field = document.querySelector(fieldSelector);
        if (field) {
            field.removeAttribute('data-validate');
            this.clearFieldError(field);
        }
    }

    /**
     * Enable/disable real-time validation
     */
    setRealTimeValidation(enabled) {
        this.realTimeValidation = enabled;
    }

    /**
     * Set debounce timeout for real-time validation
     */
    setDebounceTimeout(timeout) {
        this.debounceTimeout = timeout;
    }

    /**
     * Get validation summary for form
     */
    getValidationSummary(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        const summary = {
            totalFields: fields.length,
            validFields: 0,
            invalidFields: 0,
            errors: []
        };
        
        fields.forEach(field => {
            const isValid = this.validateField(field, false);
            if (isValid) {
                summary.validFields++;
            } else {
                summary.invalidFields++;
                const rules = this.getFieldRules(field);
                const fieldErrors = [];
                
                rules.forEach(rule => {
                    if (!this.applyRule(rule, field.value)) {
                        fieldErrors.push(this.getErrorMessage(rule, field));
                    }
                });
                
                summary.errors.push({
                    field: field.name || field.id,
                    errors: fieldErrors
                });
            }
        });
        
        return summary;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidationManager;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.FormValidationManager = FormValidationManager;
}