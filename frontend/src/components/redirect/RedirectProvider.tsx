import React, { useEffect, useState } from 'react';
import { checkForRedirect } from '../../services/redirect';

interface RedirectProviderProps {
  children: React.ReactNode;
}

/**
 * RedirectProvider component
 * 
 * This component checks if the current URL needs to be redirected according to
 * the VARAi URL schema and performs the redirect if necessary.
 * 
 * It should be placed near the root of the application to ensure redirects
 * happen before the rest of the application renders.
 */
const RedirectProvider: React.FC<RedirectProviderProps> = ({ children }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if we need to redirect
    const redirect = checkForRedirect();
    
    if (redirect) {
      setIsRedirecting(true);
      
      // Add a small delay to allow the state to update
      // This is optional but can help with debugging
      setTimeout(() => {
        // In a real application, we would set the appropriate status code
        // For now, we'll just redirect the user
        window.location.href = redirect.url;
      }, 100);
    }
  }, []);

  // If we're redirecting, show a simple message
  if (isRedirecting) {
    return (
      <div className="redirect-message">
        <p>Redirecting to the new VARAi platform...</p>
      </div>
    );
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default RedirectProvider;