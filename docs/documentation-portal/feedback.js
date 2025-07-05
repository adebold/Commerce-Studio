/**
 * VARAi Documentation Portal Feedback Functionality
 * 
 * This script provides feedback functionality for the documentation portal.
 * It allows users to submit feedback about the documentation.
 */

// Function to initialize the feedback functionality
function initFeedback() {
    const feedbackButton = document.getElementById('feedback-button');
    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackForm = document.getElementById('feedback-form');
    const closeButton = feedbackModal ? feedbackModal.querySelector('.close') : null;
    
    if (!feedbackButton || !feedbackModal || !feedbackForm || !closeButton) {
        console.error('Feedback elements not found in the DOM');
        return;
    }
    
    // Open the feedback modal when the button is clicked
    feedbackButton.addEventListener('click', function() {
        feedbackModal.style.display = 'block';
        
        // Set the current page URL in a hidden field
        let currentPageField = feedbackForm.querySelector('#current-page');
        if (!currentPageField) {
            currentPageField = document.createElement('input');
            currentPageField.type = 'hidden';
            currentPageField.id = 'current-page';
            currentPageField.name = 'current-page';
            feedbackForm.appendChild(currentPageField);
        }
        currentPageField.value = window.location.href;
    });
    
    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', function() {
        feedbackModal.style.display = 'none';
        resetForm();
    });
    
    // Close the modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
            resetForm();
        }
    });
    
    // Handle form submission
    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const feedbackType = document.getElementById('feedback-type').value;
        const feedbackText = document.getElementById('feedback-text').value;
        const feedbackEmail = document.getElementById('feedback-email').value;
        const currentPage = document.getElementById('current-page').value;
        
        // Validate form data
        if (!feedbackText.trim()) {
            alert('Please enter your feedback.');
            return;
        }
        
        // Prepare feedback data
        const feedbackData = {
            type: feedbackType,
            text: feedbackText,
            email: feedbackEmail,
            page: currentPage,
            timestamp: new Date().toISOString()
        };
        
        // In a real implementation, this would send the feedback to a server
        // For demonstration purposes, we'll just log it to the console and show a success message
        console.log('Feedback submitted:', feedbackData);
        
        // Show success message
        showSuccessMessage();
        
        // Reset the form
        resetForm();
        
        // Close the modal after a delay
        setTimeout(function() {
            feedbackModal.style.display = 'none';
        }, 3000);
    });
    
    // Function to show a success message
    function showSuccessMessage() {
        // Remove any existing success message
        const existingMessage = feedbackForm.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create a success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your feedback! We appreciate your input.';
        successMessage.style.color = '#28a745';
        successMessage.style.marginTop = '1rem';
        successMessage.style.fontWeight = 'bold';
        
        // Add the success message to the form
        feedbackForm.appendChild(successMessage);
    }
    
    // Function to reset the form
    function resetForm() {
        feedbackForm.reset();
        
        // Remove any success message
        const successMessage = feedbackForm.querySelector('.success-message');
        if (successMessage) {
            successMessage.remove();
        }
    }
    
    // Add character counter for feedback text
    const feedbackText = document.getElementById('feedback-text');
    if (feedbackText) {
        // Create character counter element
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        charCounter.textContent = '0 / 1000 characters';
        charCounter.style.fontSize = '0.8rem';
        charCounter.style.color = '#6c757d';
        charCounter.style.textAlign = 'right';
        charCounter.style.marginTop = '0.25rem';
        
        // Insert after the textarea
        feedbackText.parentNode.insertBefore(charCounter, feedbackText.nextSibling);
        
        // Update character count on input
        feedbackText.addEventListener('input', function() {
            const count = feedbackText.value.length;
            charCounter.textContent = `${count} / 1000 characters`;
            
            // Change color if approaching limit
            if (count > 900) {
                charCounter.style.color = '#ffc107';
            } else if (count > 1000) {
                charCounter.style.color = '#dc3545';
            } else {
                charCounter.style.color = '#6c757d';
            }
        });
    }
}

// Initialize the feedback functionality when the page loads
document.addEventListener('DOMContentLoaded', initFeedback);