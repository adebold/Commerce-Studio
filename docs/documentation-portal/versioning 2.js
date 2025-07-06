/**
 * VARAi Documentation Portal Versioning Functionality
 * 
 * This script provides versioning functionality for the documentation portal.
 * It allows users to switch between different versions of the documentation.
 */

// Version configuration
const versionConfig = {
    latest: {
        label: 'Latest (v1.0.0)',
        path: ''  // Current path
    },
    'v0.9.0': {
        label: 'v0.9.0',
        path: '/v0.9.0'
    },
    'v0.8.0': {
        label: 'v0.8.0',
        path: '/v0.8.0'
    }
};

// Function to initialize the versioning functionality
function initVersioning() {
    const versionSelector = document.getElementById('version');
    
    if (!versionSelector) {
        console.error('Version selector not found in the DOM');
        return;
    }
    
    // Set the current version based on the URL
    setCurrentVersion();
    
    // Add event listener for version changes
    versionSelector.addEventListener('change', function() {
        const selectedVersion = versionSelector.value;
        switchVersion(selectedVersion);
    });
    
    // Add version information to the page
    addVersionInfo();
}

// Function to set the current version based on the URL
function setCurrentVersion() {
    const versionSelector = document.getElementById('version');
    if (!versionSelector) return;
    
    const currentPath = window.location.pathname;
    
    // Determine which version we're currently viewing
    let currentVersion = 'latest';
    
    for (const version in versionConfig) {
        if (version === 'latest') continue;
        
        if (currentPath.includes(versionConfig[version].path)) {
            currentVersion = version;
            break;
        }
    }
    
    // Set the selector to the current version
    versionSelector.value = currentVersion;
}

// Function to switch to a different version
function switchVersion(version) {
    if (!versionConfig[version]) {
        console.error(`Version ${version} not found in configuration`);
        return;
    }
    
    const currentPath = window.location.pathname;
    const currentVersion = getCurrentVersionFromPath(currentPath);
    
    if (version === currentVersion) {
        // Already on this version, no need to switch
        return;
    }
    
    // Construct the new URL
    let newPath = currentPath;
    
    // Remove the current version path if it exists
    if (currentVersion !== 'latest') {
        newPath = newPath.replace(versionConfig[currentVersion].path, '');
    }
    
    // Add the new version path if it's not latest
    if (version !== 'latest') {
        // Handle the case where the path doesn't start with a slash
        if (!newPath.startsWith('/')) {
            newPath = '/' + newPath;
        }
        
        newPath = versionConfig[version].path + newPath;
    }
    
    // Navigate to the new URL
    window.location.href = newPath;
}

// Function to get the current version from the path
function getCurrentVersionFromPath(path) {
    for (const version in versionConfig) {
        if (version === 'latest') continue;
        
        if (path.includes(versionConfig[version].path)) {
            return version;
        }
    }
    
    return 'latest';
}

// Function to add version information to the page
function addVersionInfo() {
    const contentSection = document.querySelector('.content');
    if (!contentSection) return;
    
    // Get the current version
    const currentPath = window.location.pathname;
    const currentVersion = getCurrentVersionFromPath(currentPath);
    
    // Create version info element
    const versionInfo = document.createElement('div');
    versionInfo.className = 'version-info';
    versionInfo.style.marginTop = '3rem';
    versionInfo.style.paddingTop = '1rem';
    versionInfo.style.borderTop = '1px solid #dee2e6';
    versionInfo.style.fontSize = '0.9rem';
    versionInfo.style.color = '#6c757d';
    
    // Add version information
    versionInfo.innerHTML = `
        <p>You are viewing documentation for version ${versionConfig[currentVersion].label}.</p>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
    `;
    
    // Add version comparison if not on latest
    if (currentVersion !== 'latest') {
        const compareLink = document.createElement('p');
        compareLink.innerHTML = `<a href="${window.location.pathname.replace(versionConfig[currentVersion].path, '')}">View latest version</a>`;
        versionInfo.appendChild(compareLink);
    }
    
    // Add to the page
    contentSection.appendChild(versionInfo);
    
    // Set data attribute for print stylesheet
    contentSection.setAttribute('data-print-date', new Date().toLocaleDateString());
}

// Initialize the versioning functionality when the page loads
document.addEventListener('DOMContentLoaded', initVersioning);