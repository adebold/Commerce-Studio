/**
 * VARAi Commerce Studio - Enterprise Website Enhancements JavaScript
 * Interactive functionality for enhanced hero section, ROI calculator, and trust signals
 */

class VaraiEnterpriseEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupROICalculator();
        this.setupMetricCounters();
        this.setupModalHandlers();
        this.setupLeadMagnets();
    }

    setupEventListeners() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindEvents();
            });
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        // CTA button handlers
        const trialButtons = document.querySelectorAll('[onclick="openTrialModal()"]');
        trialButtons.forEach(button => {
            button.removeAttribute('onclick');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openTrialModal();
            });
        });

        const demoButtons = document.querySelectorAll('[onclick="openDemoModal()"]');
        demoButtons.forEach(button => {
            button.removeAttribute('onclick');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openDemoModal();
            });
        });

        const roiButtons = document.querySelectorAll('[onclick="openROICalculator()"]');
        roiButtons.forEach(button => {
            button.removeAttribute('onclick');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToROICalculator();
            });
        });

        const guideLinks = document.querySelectorAll('[onclick="downloadGuide()"]');
        guideLinks.forEach(link => {
            link.removeAttribute('onclick');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadGuide();
            });
        });
    }

    initializeAnimations() {
        // Animate metric counters when they come into view
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('metric-number')) {
                        this.animateCounter(entry.target);
                    }
                    if (entry.target.classList.contains('chart-bar')) {
                        entry.target.style.animationPlayState = 'running';
                    }
                }
            });
        }, observerOptions);

        // Observe metric numbers and chart bars
        document.querySelectorAll('.metric-number[data-target]').forEach(el => {
            observer.observe(el);
        });

        document.querySelectorAll('.chart-bar').forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const start = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            element.textContent = currentValue + (element.textContent.includes('%') ? '%' : '');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target + (target === 47 || target === 62 || target === 89 ? '%' : target === 3.2 ? 'x' : '');
            }
        };

        requestAnimationFrame(animate);
    }

    setupROICalculator() {
        // Create and inject ROI calculator after features section
        const featuresSection = document.querySelector('.varai-section.varai-bg-light');
        if (featuresSection && !document.querySelector('.varai-roi-calculator')) {
            const roiSection = this.createROICalculatorSection();
            featuresSection.insertAdjacentElement('afterend', roiSection);
        }
    }

    createROICalculatorSection() {
        const section = document.createElement('section');
        section.className = 'varai-section';
        section.id = 'roi-calculator';
        
        section.innerHTML = `
            <div class="varai-container">
                <div class="varai-roi-calculator">
                    <h3>Calculate Your ROI with VARAi</h3>
                    <div class="calculator-inputs">
                        <div>
                            <label for="visitors">Monthly Website Visitors</label>
                            <input type="number" id="visitors" placeholder="10,000" value="10000">
                        </div>
                        <div>
                            <label for="conversion">Current Conversion Rate (%)</label>
                            <input type="number" id="conversion" placeholder="2.5" value="2.5" step="0.1">
                        </div>
                        <div>
                            <label for="aov">Average Order Value ($)</label>
                            <input type="number" id="aov" placeholder="150" value="150">
                        </div>
                    </div>
                    <div class="calculator-results">
                        <div class="result-metric">
                            <span class="result-label">Potential Monthly Revenue Increase:</span>
                            <span class="result-value" id="revenue-increase">$0</span>
                        </div>
                        <div class="result-metric">
                            <span class="result-label">Annual ROI:</span>
                            <span class="result-value" id="annual-roi">0%</span>
                        </div>
                    </div>
                    <button class="varai-btn varai-btn-primary" onclick="varaiEnhancements.requestDetailedReport()">
                        Get Detailed ROI Report
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for real-time calculation
        setTimeout(() => {
            const inputs = section.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.calculateROI());
            });
            
            // Initial calculation
            this.calculateROI();
        }, 100);

        return section;
    }

    calculateROI() {
        const visitors = parseFloat(document.getElementById('visitors')?.value) || 0;
        const conversionRate = parseFloat(document.getElementById('conversion')?.value) || 0;
        const aov = parseFloat(document.getElementById('aov')?.value) || 0;

        // Current monthly revenue
        const currentRevenue = visitors * (conversionRate / 100) * aov;
        
        // With 47% conversion increase
        const improvedConversionRate = conversionRate * 1.47;
        const newRevenue = visitors * (improvedConversionRate / 100) * aov;
        
        // Revenue increase
        const revenueIncrease = newRevenue - currentRevenue;
        
        // Annual ROI (assuming VARAi costs $500/month)
        const monthlyCost = 500;
        const annualCost = monthlyCost * 12;
        const annualRevenueIncrease = revenueIncrease * 12;
        const roi = ((annualRevenueIncrease - annualCost) / annualCost) * 100;

        // Update display
        const revenueElement = document.getElementById('revenue-increase');
        const roiElement = document.getElementById('annual-roi');
        
        if (revenueElement) {
            revenueElement.textContent = `$${revenueIncrease.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        }
        
        if (roiElement) {
            roiElement.textContent = `${roi.toLocaleString('en-US', { maximumFractionDigits: 0 })}%`;
        }
    }

    setupMetricCounters() {
        // Add data-driven metrics section after hero
        const heroSection = document.querySelector('.varai-hero-enhanced');
        if (heroSection && !document.querySelector('.varai-value-proposition')) {
            const metricsSection = this.createMetricsSection();
            heroSection.insertAdjacentElement('afterend', metricsSection);
        }
    }

    createMetricsSection() {
        const section = document.createElement('section');
        section.className = 'varai-value-proposition';
        
        section.innerHTML = `
            <div class="varai-container">
                <h2 class="varai-metric-headline">
                    Eyewear retailers using VARAi see an average of:
                </h2>
                <div class="varai-metrics-grid">
                    <div class="metric-card">
                        <span class="metric-number" data-target="47">0</span>
                        <span class="metric-label">% Increase in Conversions</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-number" data-target="62">0</span>
                        <span class="metric-label">% Reduction in Returns</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-number" data-target="3">0</span>
                        <span class="metric-label">x Higher AOV</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-number" data-target="89">0</span>
                        <span class="metric-label">% Customer Satisfaction</span>
                    </div>
                </div>
            </div>
        `;

        return section;
    }

    setupModalHandlers() {
        // Create modal container if it doesn't exist
        if (!document.querySelector('.modal-container')) {
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            modalContainer.innerHTML = `
                <div class="modal-overlay" onclick="varaiEnhancements.closeModal()"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="varaiEnhancements.closeModal()">&times;</button>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modalContainer);

            // Add modal styles
            const modalStyles = document.createElement('style');
            modalStyles.textContent = `
                .modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                }
                
                .modal-content {
                    position: relative;
                    background: var(--varai-background);
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--varai-shadow-2xl);
                    animation: modalSlideIn 0.3s ease-out;
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--varai-gray-600);
                    z-index: 1;
                }
                
                .modal-body {
                    padding: 2rem;
                }
            `;
            document.head.appendChild(modalStyles);
        }
    }

    openTrialModal() {
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; color: var(--varai-primary);">Start Your Free 14-Day Trial</h3>
            <p style="margin-bottom: 2rem; color: var(--varai-gray-600);">
                Join 500+ eyewear retailers already using VARAi to increase sales by 47% on average.
            </p>
            <form onsubmit="varaiEnhancements.handleTrialSignup(event)">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Business Email</label>
                    <input type="email" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--varai-border); border-radius: 8px;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Company Name</label>
                    <input type="text" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--varai-border); border-radius: 8px;">
                </div>
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Monthly Website Visitors</label>
                    <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--varai-border); border-radius: 8px;">
                        <option>Less than 1,000</option>
                        <option>1,000 - 5,000</option>
                        <option>5,000 - 10,000</option>
                        <option>10,000 - 50,000</option>
                        <option>50,000+</option>
                    </select>
                </div>
                <button type="submit" class="varai-btn varai-btn-primary" style="width: 100%;">
                    Start Free Trial - No Credit Card Required
                </button>
            </form>
        `;
        this.showModal();
    }

    openDemoModal() {
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; color: var(--varai-primary);">Watch VARAi in Action</h3>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; margin-bottom: 1.5rem; background: var(--varai-gray-100); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <div style="color: var(--varai-gray-600); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">▶️</div>
                    <p>2-Minute Demo Video</p>
                    <p style="font-size: 0.9rem;">See how VARAi increases conversions by 47%</p>
                </div>
            </div>
            <div style="text-align: center;">
                <button class="varai-btn varai-btn-primary" onclick="varaiEnhancements.startTrial()">
                    Start Your Free Trial
                </button>
                <button class="varai-btn varai-btn-outline" onclick="window.open('https://visioncraft-store-353252826752.us-central1.run.app', '_blank')" style="margin-left: 1rem;">
                    Try Live Demo
                </button>
            </div>
        `;
        this.showModal();
    }

    scrollToROICalculator() {
        const calculator = document.getElementById('roi-calculator');
        if (calculator) {
            calculator.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    downloadGuide() {
        // Simulate guide download
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,VARAi Commerce Studio - The Complete Guide to AI in Eyewear Retail\n\nThis comprehensive guide covers:\n- AI-powered virtual try-on technology\n- Conversion optimization strategies\n- Customer experience enhancement\n- ROI measurement and analytics\n\nContact us for the full guide: hello@varai.com';
        link.download = 'VARAi-AI-Eyewear-Retail-Guide.txt';
        link.click();
        
        // Show success message
        this.showNotification('Guide downloaded! Check your downloads folder.', 'success');
    }

    handleTrialSignup(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        // Simulate signup process
        setTimeout(() => {
            this.closeModal();
            this.showNotification('Trial started! Check your email for setup instructions.', 'success');
        }, 1000);
    }

    startTrial() {
        this.closeModal();
        this.openTrialModal();
    }

    requestDetailedReport() {
        const visitors = document.getElementById('visitors')?.value || '10,000';
        const conversion = document.getElementById('conversion')?.value || '2.5';
        const aov = document.getElementById('aov')?.value || '150';
        
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; color: var(--varai-primary);">Get Your Detailed ROI Report</h3>
            <p style="margin-bottom: 1.5rem; color: var(--varai-gray-600);">
                Based on your inputs (${visitors} visitors, ${conversion}% conversion, $${aov} AOV), 
                we'll create a personalized ROI analysis for your business.
            </p>
            <form onsubmit="varaiEnhancements.handleReportRequest(event)">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Business Email</label>
                    <input type="email" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--varai-border); border-radius: 8px;">
                </div>
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Company Name</label>
                    <input type="text" required style="width: 100%; padding: 0.75rem; border: 1px solid var(--varai-border); border-radius: 8px;">
                </div>
                <button type="submit" class="varai-btn varai-btn-primary" style="width: 100%;">
                    Send My ROI Report
                </button>
            </form>
        `;
        this.showModal();
    }

    handleReportRequest(event) {
        event.preventDefault();
        setTimeout(() => {
            this.closeModal();
            this.showNotification('ROI report sent! Check your email in 5-10 minutes.', 'success');
        }, 1000);
    }

    showModal() {
        const modal = document.querySelector('.modal-container');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.querySelector('.modal-container');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    setupLeadMagnets() {
        // Add trust signals section after features
        const featuresSection = document.querySelector('.varai-section.varai-bg-light');
        if (featuresSection && !document.querySelector('.varai-trust-section')) {
            const trustSection = this.createTrustSignalsSection();
            // Insert after ROI calculator if it exists, otherwise after features
            const roiSection = document.getElementById('roi-calculator');
            const insertAfter = roiSection || featuresSection;
            insertAfter.insertAdjacentElement('afterend', trustSection);
        }
    }

    createTrustSignalsSection() {
        const section = document.createElement('section');
        section.className = 'varai-trust-section';
        
        section.innerHTML = `
            <div class="varai-container">
                <div class="security-certifications">
                    <h4 style="width: 100%; text-align: center; margin-bottom: 2rem; color: var(--varai-primary);">Enterprise Security & Compliance</h4>
                    <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                        <div style="text-align: center; padding: 1rem; background: var(--varai-background); border-radius: 8px; border: 1px solid var(--varai-border);">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
                            <div style="font-weight: 600; font-size: 0.9rem;">SOC 2 Certified</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--varai-background); border-radius: 8px; border: 1px solid var(--varai-border);">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛡️</div>
                            <div style="font-weight: 600; font-size: 0.9rem;">GDPR Compliant</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--varai-background); border-radius: 8px; border: 1px solid var(--varai-border);">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔐</div>
                            <div style="font-weight: 600; font-size: 0.9rem;">SSL Secured</div>
                        </div>
                    </div>
                </div>
                
                <div class="customer-reviews">
                    <div class="review-summary">
                        <span class="rating">4.9</span>
                        <div class="stars">★★★★★</div>
                        <span class="review-count">Based on 247+ customer reviews</span>
                    </div>
                </div>
                
                <div class="industry-recognition">
                    <h4 style="width: 100%; text-align: center; margin-bottom: 2rem; color: var(--varai-primary);">Industry Recognition</h4>
                    <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                        <div style="text-align: center; padding: 1rem;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🏆</div>
                            <div style="font-weight: 600; font-size: 0.9rem;">Best AI Innovation 2024</div>
                        </div>
                        <div style="text-align: center; padding: 1rem;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⭐</div>
                            <div style="font-weight: 600; font-size: 0.9rem;">Top Retail Tech Solution</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return section;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'var(--varai-success)' : 'var(--varai-info)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--varai-shadow-lg);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Initialize enterprise enhancements
const varaiEnhancements = new VaraiEnterpriseEnhancements();

// Make it globally available for onclick handlers
window.varaiEnhancements = varaiEnhancements;