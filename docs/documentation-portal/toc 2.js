/**
 * VARAi Documentation Portal Table of Contents Functionality
 * 
 * This script provides interactive table of contents functionality for the documentation portal.
 * It allows users to expand/collapse sections and highlights the current page in the TOC.
 */

// Function to initialize the table of contents functionality
function initTOC() {
    const tocContainer = document.getElementById('toc');
    
    if (!tocContainer) {
        return;
    }
    
    // Add expand/collapse functionality to TOC items with children
    const tocItems = tocContainer.querySelectorAll('li');
    
    tocItems.forEach(item => {
        const childList = item.querySelector('ul');
        
        if (childList) {
            // Create a toggle button
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toc-toggle';
            toggleButton.setAttribute('aria-label', 'Toggle section');
            toggleButton.innerHTML = '<span class="toggle-icon">▼</span>';
            
            // Insert the toggle button before the link
            const link = item.querySelector('a');
            if (link) {
                link.parentNode.insertBefore(toggleButton, link);
            }
            
            // Add click event to toggle visibility
            toggleButton.addEventListener('click', function() {
                childList.classList.toggle('collapsed');
                toggleButton.querySelector('.toggle-icon').textContent = 
                    childList.classList.contains('collapsed') ? '▶' : '▼';
            });
        }
    });
    
    // Highlight the current page in the TOC
    highlightCurrentPage();
    
    // Add scroll spy functionality for in-page navigation
    addScrollSpy();
}

// Function to highlight the current page in the TOC
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const tocLinks = document.querySelectorAll('#toc a');
    
    tocLinks.forEach(link => {
        // Get the path from the href attribute
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        // Check if this link corresponds to the current page
        if (linkPath === currentPath) {
            link.classList.add('current-page');
            
            // Expand parent lists to show the current page
            let parent = link.parentNode;
            while (parent && parent.id !== 'toc') {
                if (parent.tagName === 'UL') {
                    parent.classList.remove('collapsed');
                    
                    // Update the toggle button if there is one
                    const parentLi = parent.parentNode;
                    if (parentLi && parentLi.tagName === 'LI') {
                        const toggleButton = parentLi.querySelector('.toc-toggle');
                        if (toggleButton) {
                            toggleButton.querySelector('.toggle-icon').textContent = '▼';
                        }
                    }
                }
                parent = parent.parentNode;
            }
        }
    });
}

// Function to add scroll spy functionality for in-page navigation
function addScrollSpy() {
    // Only add scroll spy if we're on a content page (not the home page)
    const contentSection = document.querySelector('.content');
    if (!contentSection) {
        return;
    }
    
    // Get all headings in the content
    const headings = contentSection.querySelectorAll('h2, h3, h4, h5, h6');
    if (headings.length === 0) {
        return;
    }
    
    // Create in-page navigation if it doesn't exist
    let inPageNav = document.querySelector('.in-page-nav');
    if (!inPageNav) {
        inPageNav = document.createElement('div');
        inPageNav.className = 'in-page-nav';
        inPageNav.innerHTML = '<h3>On This Page</h3><ul></ul>';
        
        // Add it to the sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.appendChild(inPageNav);
        }
    }
    
    const inPageNavList = inPageNav.querySelector('ul');
    
    // Clear existing items
    inPageNavList.innerHTML = '';
    
    // Add items for each heading
    headings.forEach((heading, index) => {
        // Generate an ID for the heading if it doesn't have one
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }
        
        // Create a list item for this heading
        const listItem = document.createElement('li');
        listItem.className = 'nav-level-' + heading.tagName.toLowerCase();
        
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        
        listItem.appendChild(link);
        inPageNavList.appendChild(listItem);
        
        // Add click event to scroll smoothly
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            document.getElementById(heading.id).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add scroll event to highlight the current section
    window.addEventListener('scroll', debounce(function() {
        // Find the heading that is currently at the top of the viewport
        let currentHeading = null;
        let smallestDistance = Infinity;
        
        headings.forEach(heading => {
            const distance = Math.abs(heading.getBoundingClientRect().top - 100);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                currentHeading = heading;
            }
        });
        
        if (currentHeading) {
            // Remove highlight from all links
            const links = inPageNavList.querySelectorAll('a');
            links.forEach(link => {
                link.classList.remove('active');
            });
            
            // Add highlight to the current link
            const currentLink = inPageNavList.querySelector('a[href="#' + currentHeading.id + '"]');
            if (currentLink) {
                currentLink.classList.add('active');
            }
        }
    }, 100));
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// Initialize the TOC functionality when the page loads
document.addEventListener('DOMContentLoaded', initTOC);