/**
 * VARAi Commerce Studio - Main JavaScript
 * Handles common functionality across the website
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    setupFormValidation();
    initializeAnimations();
    setupDarkModeToggle();
});

/**
 * Initializes the responsive navigation menu
 */
function initializeNavigation() {
    // Create mobile navigation toggle
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    if (!header || !nav) return;
    
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-toggle');
    mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
    mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
    
    header.insertBefore(mobileMenuBtn, header.firstChild);
    
    // Add mobile navigation functionality
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (nav.classList.contains('active') && 
            !nav.contains(event.target) && 
            !mobileMenuBtn.contains(event.target)) {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

/**
 * Sets up form validation for all forms
 */
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Validate required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    highlightInvalidField(field);
                } else {
                    removeInvalidHighlight(field);
                }
            });
            
            // Validate email fields
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    highlightInvalidField(field);
                }
            });
            
            if (!isValid) {
                event.preventDefault();
                showFormError(form, 'Please fill in all required fields correctly.');
            }
        });
    });
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Highlights an invalid form field
 * @param {Element} field - The field to highlight
 */
function highlightInvalidField(field) {
    field.classList.add('invalid');
    
    // Add error message if it doesn't exist
    const parent = field.parentElement;
    if (!parent.querySelector('.error-message')) {
        const errorMessage = document.createElement('span');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = field.dataset.errorMessage || 'This field is required';
        parent.appendChild(errorMessage);
    }
    
    // Remove invalid state when user corrects the field
    field.addEventListener('input', function() {
        removeInvalidHighlight(field);
    }, { once: true });
}

/**
 * Removes invalid highlighting from a field
 * @param {Element} field - The field to remove highlighting from
 */
function removeInvalidHighlight(field) {
    field.classList.remove('invalid');
    
    // Remove error message if it exists
    const parent = field.parentElement;
    const errorMessage = parent.querySelector('.error-message');
    if (errorMessage) {
        parent.removeChild(errorMessage);
    }
}

/**
 * Shows a form error message
 * @param {Element} form - The form to show the error for
 * @param {string} message - The error message to display
 */
function showFormError(form, message) {
    // Remove existing error message
    const existingError = form.querySelector('.form-error');
    if (existingError) {
        form.removeChild(existingError);
    }
    
    // Create and add new error message
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('form-error');
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Initializes animations for page elements
 */
function initializeAnimations() {
    // Fade in elements as they scroll into view
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        // Set initial state
        animatedElements.forEach(el => {
            el.classList.add('hidden');
        });
        
        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Observe each element
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
}

/**
 * Sets up dark mode toggle functionality
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    
    if (!darkModeToggle) return;
    
    // Check for saved preference
    const prefersDarkMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial state
    if (prefersDarkMode || (systemPrefersDark && localStorage.getItem('darkMode') === null)) {
        document.body.classList.add('dark-mode');
        darkModeToggle.setAttribute('aria-pressed', 'true');
    }
    
    // Toggle dark mode on click
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        darkModeToggle.setAttribute('aria-pressed', isDarkMode.toString());
    });
}