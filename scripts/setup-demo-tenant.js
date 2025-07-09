const axios = require('axios');

const TENANT_API_URL = process.env.TENANT_API_URL || 'http://localhost:3001/api';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

async function setupDemoTenant() {
  if (!ADMIN_API_KEY) {
    console.error('ADMIN_API_KEY environment variable is not set.');
    return;
  }

  const apiClient = axios.create({
    baseURL: TENANT_API_URL,
    headers: { 'Authorization': `Bearer ${ADMIN_API_KEY}` }
  });

  try {
    // 1. Create a new tenant for the demo
    console.log('Creating demo tenant...');
    const tenantResponse = await apiClient.post('/tenants', {
      companyName: 'Commerce Studio Demo',
      subdomain: 'demo',
      tier: 'premium'
    });
    const tenant = tenantResponse.data.data;
    console.log(`Demo tenant created with ID: ${tenant.id}`);

    // 2. Configure the demo store
    console.log('Configuring demo store...');
    const config = {
      branding: {
        companyName: 'Commerce Studio Demo Store',
        logo: 'https://example.com/logo.png',
        favicon: 'https://example.com/favicon.ico',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745'
        },
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Helvetica, sans-serif'
        }
      },
      features: {
        consultation: true,
        vto: true,
        faceAnalysis: true,
        recommendations: true,
        analytics: true
      },
      commerce: {
        catalogId: 'demo-catalog',
        categories: ['sunglasses', 'eyeglasses'],
        paymentMethods: ['credit_card', 'paypal'],
        shipping: {
          enabled: true,
          methods: ['standard', 'express']
        }
      },
      integrations: {
        shopify: {
          credentials: {
            shopName: 'your-demo-shop.myshopify.com',
            accessToken: 'your-demo-shopify-access-token'
          }
        }
      }
    };

    await apiClient.put(`/tenants/${tenant.id}/config`, {
      configKey: 'default',
      configValue: config
    });
    console.log('Demo store configured successfully.');

    // 3. Provision the demo store
    console.log('Provisioning demo store...');
    const provisionResponse = await axios.post('http://localhost:3002/api/provision/store', {
      tenantId: tenant.id
    });
    console.log(`Store provisioning job started with ID: ${provisionResponse.data.jobId}`);

    console.log('\nDemo tenant setup complete!');
    console.log(`View provisioning status at: http://localhost:3002/admin/queues`);

  } catch (error) {
    console.error('Failed to set up demo tenant:', error.response?.data || error.message);
  }
}

setupDemoTenant();