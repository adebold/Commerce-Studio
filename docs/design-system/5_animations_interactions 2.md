# Apple-Inspired UI Design System - Part 5: Animations & Interactions

## 9. Animation & Motion System

### 9.1 Animation Principles

**Apple-Inspired Motion Philosophy:**
- **Purposeful**: Every animation serves a functional purpose
- **Natural**: Motion feels organic and physics-based
- **Responsive**: Animations acknowledge user input immediately
- **Fluid**: Smooth transitions maintain spatial relationships
- **Respectful**: Motion respects user preferences and accessibility

**Timing Functions:**
```css
/* Easing Functions - Apple-inspired curves */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Duration Scale */
--duration-instant: 0.1s;
--duration-fast: 0.15s;
--duration-normal: 0.25s;
--duration-slow: 0.4s;
--duration-slower: 0.6s;
--duration-slowest: 1s;
```

### 9.2 Common Animations

#### Hover Effects
```css
/* Lift Animation - Subtle elevation on hover */
.animate-lift {
  transition: transform var(--duration-normal) var(--ease-out), 
              box-shadow var(--duration-normal) var(--ease-out);
}

.animate-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Scale Animation - Gentle scale on interaction */
.animate-scale {
  transition: transform var(--duration-fast) var(--ease-out);
}

.animate-scale:hover {
  transform: scale(1.02);
}

.animate-scale:active {
  transform: scale(0.98);
}

/* Glow Animation - Subtle glow effect */
.animate-glow {
  transition: box-shadow var(--duration-normal) var(--ease-out);
}

.animate-glow:hover {
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
}
```

#### Loading States
```css
/* Skeleton Loading - Shimmer effect */
.skeleton {
  background: linear-gradient(90deg, 
    var(--color-gray-200) 25%, 
    var(--color-gray-100) 50%, 
    var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 2s infinite;
  border-radius: 8px;
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Pulse Loading - Gentle pulse for loading elements */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spinner - Apple-style activity indicator */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-gray-200);
  border-top: 2px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading bar - Progress indicator */
.loading-bar {
  width: 100%;
  height: 4px;
  background: var(--color-gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.loading-bar::after {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-primary-500);
  border-radius: 2px;
  transform: translateX(-100%);
  animation: loadingProgress 2s infinite;
}

@keyframes loadingProgress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
```

#### Transition Animations
```css
/* Fade transitions */
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-in);
}

/* Slide transitions */
.slide-up-enter {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-enter-active {
  transform: translateY(0);
  opacity: 1;
  transition: all var(--duration-normal) var(--ease-out);
}

/* Scale transitions */
.scale-enter {
  transform: scale(0.95);
  opacity: 0;
}

.scale-enter-active {
  transform: scale(1);
  opacity: 1;
  transition: all var(--duration-normal) var(--ease-spring);
}
```

### 9.3 Interactive Feedback

#### Button Press Feedback
```css
.button-feedback {
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.button-feedback:active {
  transform: scale(0.96);
}

/* Ripple effect for material feedback */
.button-feedback::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width var(--duration-slow) var(--ease-out),
              height var(--duration-slow) var(--ease-out);
}

.button-feedback:active::after {
  width: 200px;
  height: 200px;
}
```

#### Focus States
```css
.focus-ring {
  transition: all var(--duration-fast) var(--ease-out);
}

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}

.focus-ring:focus-visible {
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.4);
}
```

## 10. Modal & Overlay System

### 10.1 Modal Components

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 
    0 20px 25px rgba(0, 0, 0, 0.1),
    0 10px 10px rgba(0, 0, 0, 0.04);
  position: relative;
}

.modal-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.modal-close {
  background: var(--color-gray-100);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.modal-close:hover {
  background: var(--color-gray-200);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  max-height: calc(80vh - 120px);
}

.modal-footer {
  padding: var(--space-4) var(--space-6) var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  border-top: 1px solid var(--color-gray-200);
}

/* Modal animations */
.modal-overlay.entering {
  animation: modalOverlayEnter var(--duration-normal) var(--ease-out);
}

.modal.entering {
  animation: modalEnter var(--duration-normal) var(--ease-spring);
}

.modal-overlay.exiting {
  animation: modalOverlayExit var(--duration-fast) var(--ease-in);
}

.modal.exiting {
  animation: modalExit var(--duration-fast) var(--ease-in);
}

@keyframes modalOverlayEnter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalOverlayExit {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes modalExit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
}
```

### 10.2 Dropdown Components

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  box-shadow: 
    0 10px 15px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 8px 0;
  min-width: 200px;
  z-index: 100;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transition: all var(--duration-fast) var(--ease-out);
  pointer-events: none;
}

.dropdown-menu.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  text-decoration: none;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}

.dropdown-item:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.dropdown-item:focus {
  outline: none;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-gray-200);
  margin: 8px 0;
}
```

### 10.3 Toast Notifications

```css
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 
    0 10px 15px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast.success {
  border-left: 4px solid var(--color-success-500);
}

.toast.error {
  border-left: 4px solid var(--color-error-500);
}

.toast.warning {
  border-left: 4px solid var(--color-warning-500);
}

.toast.info {
  border-left: 4px solid var(--color-info-500);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px;
}

.toast-message {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  margin: 0;
}

.toast-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-gray-400);
  transition: color var(--duration-fast) var(--ease-out);
}

.toast-close:hover {
  color: var(--color-gray-600);
}

/* Toast animations */
.toast.entering {
  animation: toastEnter var(--duration-normal) var(--ease-spring);
}

.toast.exiting {
  animation: toastExit var(--duration-fast) var(--ease-in);
}

@keyframes toastEnter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toastExit {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Progress bar for auto-dismiss */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--color-primary-500);
  animation: toastProgress 5s linear;
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}