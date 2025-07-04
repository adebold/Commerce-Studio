/**
 * Apple-Inspired Landing Page JavaScript
 * VARAi Commerce Studio - Phase 2 Implementation
 * Interactive functionality for the landing page
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializePricingToggle();
    initializeModals();
    initializeFormHandlers();
    initializeSmoothScrolling();
});

/**
 * Navigation functionality
 */
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.querySelector('.apple-mobile-menu-toggle');
    const nav = document.querySelector('.apple-nav');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
            
            // Animate hamburger menu
            const spans = mobileToggle.querySelectorAll('span');
            if (nav.classList.contains('mobile-open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && nav.classList.contains('mobile-open')) {
            nav.classList.remove('mobile-open');
            resetMobileMenuIcon();
        }
    });
    
    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('mobile-open')) {
            nav.classList.remove('mobile-open');
            resetMobileMenuIcon();
        }
    });
    
    function resetMobileMenuIcon() {
        const spans = mobileToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
    }
}

/**
 * Scroll-triggered animations and effects
 */
function initializeScrollEffects() {
    // Intersection Observer for section animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger specific animations for different sections
                if (entry.target.classList.contains('apple-hero')) {
                    animateHeroMetrics();
                }
                
                if (entry.target.classList.contains('apple-integration')) {
                    animateIntegrationConnections();
                }
                
                if (entry.target.classList.contains('apple-pricing')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.apple-section, .apple-hero').forEach(section => {
        observer.observe(section);
    });
}

/**
 * Hero section animations
 */
function initializeAnimations() {
    // Floating cards animation
    animateFloatingCards();
    
    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.apple-hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

function animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
        card.classList.add('floating');
        
        // Add random movement
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            card.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 1000);
    });
}

function animateHeroMetrics() {
    const metricNumbers = document.querySelectorAll('.metric-number');
    metricNumbers.forEach(metric => {
        const finalValue = metric.textContent;
        const isPercentage = finalValue.includes('%');
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        animateCounter(metric, 0, numericValue, 2000, isPercentage ? '%' : '');
    });
}

/**
 * Integration section animations
 */
function animateIntegrationConnections() {
    const connections = document.querySelectorAll('.connection-line');
    connections.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.animation = 'pulse 3s ease-in-out infinite';
        }, index * 200);
    });
}

/**
 * Counter animation utility
 */
function animateCounter(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const text = stat.textContent;
        let numericValue, suffix;
        
        if (text.includes('%')) {
            numericValue = parseFloat(text);
            suffix = '%';
        } else if (text.includes('min')) {
            numericValue = parseInt(text);
            suffix = 'min';
        } else if (text.includes('+')) {
            numericValue = parseInt(text.replace('+', ''));
            suffix = '+';
        } else {
            numericValue = parseFloat(text);
            suffix = '';
        }
        
        animateCounter(stat, 0, numericValue, 2000, suffix);
    });
}

/**
 * Pricing toggle functionality
 */
function initializePricingToggle() {
    const toggle = document.querySelector('.pricing-switch');
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
        togglePricing();
    });
}

function togglePricing() {
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');
    const toggle = document.querySelector('.pricing-switch');
    
    if (!toggle) return;
    
    toggle.classList.toggle('active');
    
    const isAnnual = toggle.classList.contains('active');
    
    monthlyPrices.forEach(price => {
        price.style.display = isAnnual ? 'none' : 'inline';
    });
    
    annualPrices.forEach(price => {
        price.style.display = isAnnual ? 'inline' : 'none';
    });
    
    // Add animation effect
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    });
}

/**
 * Modal functionality
 */
function initializeModals() {
    // Demo modal
    const demoModal = document.getElementById('demoModal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDemoModal);
    }
    
    // Close modal when clicking outside
    if (demoModal) {
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                closeDemoModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && demoModal && demoModal.style.display === 'flex') {
            closeDemoModal();
        }
    });
}

function playDemo() {
    const demoModal = document.getElementById('demoModal');
    if (demoModal) {
        demoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        const focusableElements = demoModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

function closeDemoModal() {
    const demoModal = document.getElementById('demoModal');
    if (demoModal) {
        demoModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function playDemoVideo() {
    // In a real implementation, this would integrate with a video player
    // For now, we'll show a placeholder message
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #000; color: white; border-radius: 12px;">
                <div style="text-align: center;">
                    <h3>Demo Video</h3>
                    <p>This would be the actual product demo video</p>
                    <button onclick="closeDemoModal()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #FF5A5F; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
    }
}

/**
 * Form handling
 */
function initializeFormHandlers() {
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearValidationErrors);
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showValidationError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Getting Started...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In a real implementation, this would submit to your backend
        showSuccessMessage(`Thank you! We'll send setup instructions to ${email}`);
        
        // Reset form
        event.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Redirect to dashboard for demo purposes
        setTimeout(() => {
            window.location.href = 'dashboard/index.html';
        }, 2000);
    }, 1500);
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showValidationError('Please enter a valid email address');
        return false;
    }
    
    clearValidationErrors();
    return true;
}

function clearValidationErrors() {
    const errorMsg = document.querySelector('.validation-error');
    if (errorMsg) {
        errorMsg.remove();
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.style.borderColor = '';
    }
}

function showValidationError(message) {
    clearValidationErrors();
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.style.borderColor = '#ef4444';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        emailInput.parentNode.appendChild(errorDiv);
    }
}

function showSuccessMessage(message) {
    clearValidationErrors();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 12px;
        text-align: center;
        margin-top: 1rem;
        animation: slideIn 0.3s ease-out;
    `;
    successDiv.textContent = message;
    
    const formContainer = document.querySelector('.signup-form-container');
    if (formContainer) {
        formContainer.appendChild(successDiv);
    }
}

/**
 * Smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Account for fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const nav = document.querySelector('.apple-nav');
                if (nav && nav.classList.contains('mobile-open')) {
                    nav.classList.remove('mobile-open');
                }
            }
        });
    });
}

/**
 * Utility functions
 */

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add optimized scroll listener
window.addEventListener('scroll', throttle(() => {
    // Parallax effects and other scroll-based animations
    const scrolled = window.pageYOffset;
    
    // Update floating cards position
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
        const speed = 0.5 + (index * 0.1);
        card.style.transform = `translateY(${scrolled * speed * 0.1}px)`;
    });
}, 16)); // ~60fps

// Preload critical resources
function preloadResources() {
    const criticalImages = [
        // Add any critical images here
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Initialize preloading
preloadResources();

// Export functions for global access
window.playDemo = playDemo;
window.closeDemoModal = closeDemoModal;
window.playDemoVideo = playDemoVideo;
window.togglePricing = togglePricing;
window.handleSignup = handleSignup;