/**
 * VARAi Theme Manager
 * Handles theme switching, animations, and dynamic UI enhancements
 */

class VaraiThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.detectSystemTheme();
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupIntersectionObserver();
        this.enhanceInteractivity();
    }

    detectSystemTheme() {
        // Check for saved theme preference or default to system preference
        const savedTheme = localStorage.getItem('varai-theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        this.currentTheme = savedTheme || systemTheme;
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('varai-theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update theme toggle button if it exists
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.classList.toggle('dark', theme === 'dark');
        }
        
        // Trigger theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('varai-theme', newTheme);
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.varai-mobile-menu-toggle');
        const navbarNav = document.querySelector('.varai-navbar-nav');

        if (mobileMenuToggle && navbarNav) {
            mobileMenuToggle.addEventListener('click', () => {
                navbarNav.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
                
                // Animate hamburger menu
                this.animateHamburgerMenu(mobileMenuToggle);
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Enhanced button interactions
        document.querySelectorAll('.varai-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => this.animateButtonHover(btn, true));
            btn.addEventListener('mouseleave', () => this.animateButtonHover(btn, false));
            btn.addEventListener('click', (e) => this.animateButtonClick(btn, e));
        });

        // Card hover effects
        document.querySelectorAll('.varai-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.animateCardHover(card, true));
            card.addEventListener('mouseleave', () => this.animateCardHover(card, false));
        });
    }

    animateHamburgerMenu(toggle) {
        const spans = toggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (toggle.classList.contains('active')) {
                // Transform to X
                if (index === 0) {
                    span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                } else if (index === 1) {
                    span.style.opacity = '0';
                } else if (index === 2) {
                    span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                }
            } else {
                // Transform back to hamburger
                span.style.transform = 'none';
                span.style.opacity = '1';
            }
        });
    }

    animateButtonHover(btn, isHover) {
        if (isHover) {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        } else {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '';
        }
    }

    animateButtonClick(btn, event) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateCardHover(card, isHover) {
        if (isHover) {
            card.style.transform = 'translateY(-4px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        }
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElementIn(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animation elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Observe feature icons for special animation
        document.querySelectorAll('.varai-feature-icon').forEach(el => {
            observer.observe(el);
        });
    }

    animateElementIn(element) {
        element.classList.add('animated');
        
        // Special animations for different element types
        if (element.classList.contains('varai-feature-icon')) {
            this.animateFeatureIcon(element);
        }
        
        if (element.classList.contains('varai-testimonial')) {
            this.animateTestimonial(element);
        }
        
        if (element.classList.contains('varai-step-number')) {
            this.animateStepNumber(element);
        }
    }

    animateFeatureIcon(icon) {
        setTimeout(() => {
            icon.style.animation = 'pulse 2s infinite';
        }, 500);
    }

    animateTestimonial(testimonial) {
        const avatar = testimonial.querySelector('.varai-avatar');
        if (avatar) {
            setTimeout(() => {
                avatar.style.animation = 'bounce 1s ease-out';
            }, 300);
        }
    }

    animateStepNumber(stepNumber) {
        setTimeout(() => {
            stepNumber.style.animation = 'rotate 1s ease-out';
        }, 200);
    }

    initializeAnimations() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0, 0, 0);
                }
                40%, 43% {
                    transform: translate3d(0, -8px, 0);
                }
                70% {
                    transform: translate3d(0, -4px, 0);
                }
                90% {
                    transform: translate3d(0, -2px, 0);
                }
            }
            
            @keyframes rotate {
                from {
                    transform: rotate(0deg) scale(0.8);
                }
                to {
                    transform: rotate(360deg) scale(1);
                }
            }
            
            .varai-btn {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .varai-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animate-on-scroll.animated {
                opacity: 1;
                transform: translateY(0);
            }
            
            .varai-mobile-menu-toggle span {
                display: block;
                width: 24px;
                height: 2px;
                background: currentColor;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .varai-navbar-nav.active {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--varai-glass-bg);
                backdrop-filter: var(--varai-glass-backdrop);
                -webkit-backdrop-filter: var(--varai-glass-backdrop);
                border-top: 1px solid var(--varai-border);
                padding: var(--varai-space-4);
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Parallax effect for hero section */
            .varai-hero {
                background-attachment: fixed;
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
            }
            
            /* Glassmorphism enhancements */
            .varai-card-glass {
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            /* Loading states */
            .varai-loading {
                position: relative;
                overflow: hidden;
            }
            
            .varai-loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                100% {
                    left: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    enhanceInteractivity() {
        // Add loading states to buttons
        document.querySelectorAll('.varai-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.href && !btn.href.startsWith('#')) {
                    btn.classList.add('varai-loading');
                    setTimeout(() => {
                        btn.classList.remove('varai-loading');
                    }, 1000);
                }
            });
        });

        // Add parallax effect to hero section
        const hero = document.querySelector('.varai-hero');
        if (hero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            });
        }

        // Add dynamic gradient to feature icons
        document.querySelectorAll('.varai-feature-icon').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.background = 'linear-gradient(135deg, var(--varai-primary) 0%, var(--varai-secondary) 100%)';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.background = 'linear-gradient(135deg, var(--varai-accent) 0%, var(--varai-accent-light) 100%)';
            });
        });

        // Add typing effect to hero title
        this.addTypingEffect();
    }

    addTypingEffect() {
        const heroTitle = document.querySelector('.varai-hero h1');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            heroTitle.style.borderRight = '2px solid var(--varai-primary)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                } else {
                    setTimeout(() => {
                        heroTitle.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            // Start typing effect after a delay
            setTimeout(typeWriter, 1000);
        }
    }

    // Public API methods
    setTheme(theme) {
        this.applyTheme(theme);
        localStorage.setItem('varai-theme', theme);
    }

    getTheme() {
        return this.currentTheme;
    }

    addCustomAnimation(element, animationName, duration = '1s') {
        element.style.animation = `${animationName} ${duration} ease-out`;
    }

    // Performance optimization
    debounce(func, wait) {
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
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.varaiThemeManager = new VaraiThemeManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaraiThemeManager;
}