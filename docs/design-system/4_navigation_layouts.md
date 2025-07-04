# Apple-Inspired UI Design System - Part 4: Navigation & Layouts

## 7. Navigation Components

### 7.1 Top Navigation Bar

```css
.navbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 0 var(--space-6);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--color-gray-900);
  text-decoration: none;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-item {
  position: relative;
}

.navbar-link {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-600);
  text-decoration: none;
  transition: all 0.2s ease;
}

.navbar-link:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.navbar-link.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}
```

### 7.2 Sidebar Navigation

```css
.sidebar {
  background: white;
  border-right: 1px solid var(--color-gray-200);
  width: 280px;
  height: calc(100vh - 64px);
  padding: var(--space-6);
  position: fixed;
  left: 0;
  top: 64px;
  overflow-y: auto;
  z-index: 50;
}

.sidebar-section {
  margin-bottom: var(--space-8);
}

.sidebar-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3);
}

.sidebar-nav {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-item {
  margin-bottom: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-700);
  text-decoration: none;
  transition: all 0.2s ease;
  gap: 12px;
}

.sidebar-link:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.sidebar-link.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.sidebar-link-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-link-badge {
  margin-left: auto;
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.sidebar-link.active .sidebar-link-badge {
  background: var(--color-primary-200);
  color: var(--color-primary-700);
}
```

### 7.3 Mobile Navigation

```css
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--color-gray-200);
  padding: 8px 0;
  z-index: 100;
}

.mobile-nav-list {
  display: flex;
  justify-content: space-around;
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  flex: 1;
  text-align: center;
}

.mobile-nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-gray-600);
  text-decoration: none;
  transition: color 0.2s ease;
  gap: 4px;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--color-primary-600);
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: block;
  }
  
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
```

### 7.4 Breadcrumb Navigation

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: var(--color-gray-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-600);
}

.breadcrumb-separator {
  color: var(--color-gray-400);
  font-size: 12px;
}

.breadcrumb-current {
  color: var(--color-gray-900);
  font-weight: 500;
}
```

## 8. Page Layout Templates

### 8.1 Dashboard Layout

```css
.dashboard-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  height: 100vh;
  background: var(--color-gray-50);
}

.dashboard-header { 
  grid-area: header; 
}

.dashboard-sidebar { 
  grid-area: sidebar; 
}

.dashboard-main { 
  grid-area: main; 
  padding: var(--space-8);
  overflow-y: auto;
}

.dashboard-content {
  max-width: var(--container-xl);
  margin: 0 auto;
}

.dashboard-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.dashboard-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: var(--space-3);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

/* Responsive Dashboard */
@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
  }
  
  .dashboard-main {
    padding: var(--space-6);
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: var(--space-4);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
```

### 8.2 Project Detail Layout

```css
.project-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav content aside";
  grid-template-columns: 240px 1fr 320px;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  background: var(--color-gray-50);
}

.project-header { 
  grid-area: header; 
  background: white;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.project-nav { 
  grid-area: nav; 
  background: white;
  padding: var(--space-6);
  border-right: 1px solid var(--color-gray-200);
}

.project-content { 
  grid-area: content; 
  padding: var(--space-8);
  overflow-y: auto;
}

.project-aside { 
  grid-area: aside; 
  background: white;
  padding: var(--space-6);
  border-left: 1px solid var(--color-gray-200);
  overflow-y: auto;
}

.project-header-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.project-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
}

.project-meta {
  display: flex;
  gap: var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

/* Responsive Project Layout */
@media (max-width: 1024px) {
  .project-layout {
    grid-template-areas:
      "header header"
      "content aside";
    grid-template-columns: 1fr 320px;
  }
  
  .project-nav {
    display: none;
  }
}

@media (max-width: 768px) {
  .project-layout {
    grid-template-areas:
      "header"
      "content";
    grid-template-columns: 1fr;
  }
  
  .project-aside {
    display: none;
  }
  
  .project-content {
    padding: var(--space-6);
  }
}
```

### 8.3 Testing Interface Layout

```css
.testing-layout {
  display: grid;
  grid-template-areas:
    "controls controls"
    "viewer sidebar";
  grid-template-columns: 1fr 400px;
  grid-template-rows: auto 1fr;
  height: 100vh;
  background: black;
}

.testing-controls { 
  grid-area: controls; 
  padding: var(--space-4);
  background: var(--color-gray-900);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.testing-viewer { 
  grid-area: viewer; 
  background: black;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.testing-sidebar { 
  grid-area: sidebar; 
  background: white;
  border-left: 1px solid var(--color-gray-200);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.testing-participant-view {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.testing-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
}

/* Responsive Testing Layout */
@media (max-width: 1024px) {
  .testing-layout {
    grid-template-areas:
      "controls"
      "viewer";
    grid-template-columns: 1fr;
  }
  
  .testing-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    z-index: 200;
    transition: right 0.3s ease;
  }
  
  .testing-sidebar.open {
    right: 0;
  }
}