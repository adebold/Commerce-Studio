import React from 'react';
import { Frame } from '@shopify/polaris';

/**
 * Authentication layout component
 * Simple layout for authentication pages without navigation
 */
function AuthLayout({ children }) {
  return (
    <Frame>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f6f6f7'
      }}>
        {children}
      </div>
    </Frame>
  );
}

export default AuthLayout;