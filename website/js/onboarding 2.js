/**
 * VARAi Commerce Studio - Onboarding JavaScript
 * Handles the multi-step signup and onboarding process
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeOnboarding();
    setupFormValidation();
    initializeProgressIndicator();
});

/**
 * Initializes the onboarding flow
 */
function initializeOnboarding() {
    const onboardingContainer = document.querySelector('.onboarding-container');
    if (!onboardingContainer) return;
    
    const steps = onboardingContainer.querySelectorAll('.onboarding-step');
    const nextButtons = onboardingContainer.querySelectorAll('.next-step');
    const prevButtons = onboardingContainer.querySelectorAll('.prev-step');
    const progressIndicator = document.querySelector('.progress-indicator');
    
    // Initialize step visibility
    steps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update progress indicator
    if (progressIndicator) {
        updateProgressIndicator(0, steps.length);
    }
    
    // Next button functionality
    nextButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            const currentStep = button.closest('.onboarding-step');
            const currentIndex = Array.from(steps).indexOf(currentStep);
            const nextIndex = currentIndex + 1;
            
            // Validate current step before proceeding
            if (!validateStep(currentStep)) {
                return;
            }
            
            // If there's a next step, show it
            if (nextIndex < steps.length) {
                currentStep.classList.remove('active');
                steps[nextIndex].classList.add('active');
                
                // Update progress indicator
                if (progressIndicator) {
                    updateProgressIndicator(nextIndex, steps.length);
                }
                
                // Scroll to top of container
                onboardingContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Previous button functionality
    prevButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            const currentStep = button.closest('.onboarding-step');
            const currentIndex = Array.from(steps).indexOf(currentStep);
            const prevIndex = currentIndex - 1;
            
            // If there's a previous step, show it
            if (prevIndex >= 0) {
                currentStep.classList.remove('active');
                steps[prevIndex].classList.add('active');
                
                // Update progress indicator
                if (progressIndicator) {
                    updateProgressIndicator(prevIndex, steps.length);
                }
                
                // Scroll to top of container
                onboardingContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Handle form submission
    const onboardingForm = onboardingContainer.querySelector('form');
    if (onboardingForm) {
        onboardingForm.addEventListener('submit', function(event) {
            // Validate all steps before submission
            let isValid = true;
            
            steps.forEach(step => {
                if (!validateStep(step, false)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                event.preventDefault();
                showFormError(onboardingForm, 'Please complete all required fields before submitting.');
            } else {
                // Show loading state
                const submitButton = onboardingForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="spinner"></span> Processing...';
                }
                
                // For demo purposes, simulate form submission
                if (onboardingForm.dataset.demo === 'true') {
                    event.preventDefault();
                    setTimeout(() => {
                        window.location.href = 'complete.html';
                    }, 2000);
                }
            }
        });
    }
}

/**
 * Validates a single step in the onboarding process
 * @param {Element} step - The step to validate
 * @param {boolean} showErrors - Whether to show error messages
 * @returns {boolean} - Whether the step is valid
 */
function validateStep(step, showErrors = true) {
    let isValid = true;
    
    // Validate required fields
    const requiredFields = step.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            if (showErrors) {
                highlightInvalidField(field);
            }
        } else if (showErrors) {
            removeInvalidHighlight(field);
        }
    });
    
    // Validate email fields
    const emailFields = step.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            isValid = false;
            if (showErrors) {
                highlightInvalidField(field);
            }
        }
    });
    
    // Validate password fields
    const passwordFields = step.querySelectorAll('input[type="password"]');
    if (passwordFields.length >= 2) {
        const password = passwordFields[0].value;
        const confirmPassword = passwordFields[1].value;
        
        if (password && confirmPassword && password !== confirmPassword) {
            isValid = false;
            if (showErrors) {
                highlightInvalidField(passwordFields[1]);
                const parent = passwordFields[1].parentElement;
                const errorMessage = parent.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = 'Passwords do not match';
                }
            }
        }
    }
    
    // Show step error message if needed
    if (!isValid && showErrors) {
        const stepError = document.createElement('div');
        stepError.classList.add('step-error');
        stepError.textContent = 'Please complete all required fields in this step.';
        
        // Remove existing error message
        const existingError = step.querySelector('.step-error');
        if (existingError) {
            step.removeChild(existingError);
        }
        
        // Add new error message
        const stepContent = step.querySelector('.step-content');
        if (stepContent) {
            stepContent.insertBefore(stepError, stepContent.firstChild);
        } else {
            step.insertBefore(stepError, step.firstChild);
        }
    }
    
    return isValid;
}

/**
 * Updates the progress indicator
 * @param {number} currentStep - The current step index (0-based)
 * @param {number} totalSteps - The total number of steps
 */
function updateProgressIndicator(currentStep, totalSteps) {
    const progressIndicator = document.querySelector('.progress-indicator');
    if (!progressIndicator) return;
    
    // Update progress bar
    const progressBar = progressIndicator.querySelector('.progress-bar');
    if (progressBar) {
        const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }
    
    // Update step indicators
    const stepIndicators = progressIndicator.querySelectorAll('.step-indicator');
    stepIndicators.forEach((indicator, index) => {
        if (index < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (index === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });
    
    // Update step labels
    const stepLabels = progressIndicator.querySelectorAll('.step-label');
    stepLabels.forEach((label, index) => {
        if (index === currentStep) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}

/**
 * Initializes the progress indicator
 */
function initializeProgressIndicator() {
    const progressIndicator = document.querySelector('.progress-indicator');
    if (!progressIndicator) return;
    
    const onboardingContainer = document.querySelector('.onboarding-container');
    if (!onboardingContainer) return;
    
    const steps = onboardingContainer.querySelectorAll('.onboarding-step');
    const stepCount = steps.length;
    
    // Create step indicators if they don't exist
    if (progressIndicator.children.length === 0) {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressIndicator.appendChild(progressBar);
        
        // Create step indicators
        const stepsContainer = document.createElement('div');
        stepsContainer.classList.add('steps-container');
        
        for (let i = 0; i < stepCount; i++) {
            // Create step indicator
            const stepIndicator = document.createElement('div');
            stepIndicator.classList.add('step-indicator');
            stepIndicator.setAttribute('data-step', i + 1);
            
            // Create step label
            const stepLabel = document.createElement('div');
            stepLabel.classList.add('step-label');
            stepLabel.textContent = steps[i].dataset.title || `Step ${i + 1}`;
            
            // Add to container
            stepsContainer.appendChild(stepIndicator);
            stepsContainer.appendChild(stepLabel);
        }
        
        progressIndicator.appendChild(stepsContainer);
    }
    
    // Initialize first step
    updateProgressIndicator(0, stepCount);
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
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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