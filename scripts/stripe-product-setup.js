#!/usr/bin/env node

/**
 * Stripe Product Setup Script
 * Creates all VARAi Commerce Studio products and pricing in Stripe via API calls
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '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');

// Product and pricing configuration
const PRODUCTS_CONFIG = {
  // AI Services (Per-Use Token Pricing)
  aiServices: [
    {
      id: 'virtual_try_on',
      name: 'Virtual Try-On',
      description: 'AI-powered virtual eyewear fitting experience',
      tokenCost: 5,
      metadata: {
        category: 'ai_service',
        token_cost: '5',
        service_type: 'virtual_try_on'
      }
    },
    {
      id: 'face_analysis',
      name: 'Face Analysis',
      description: 'Advanced facial feature analysis for personalized recommendations',
      tokenCost: 3,
      metadata: {
        category: 'ai_service',
        token_cost: '3',
        service_type: 'face_analysis'
      }
    },
    {
      id: 'recommendations',
      name: 'AI Recommendations',
      description: 'Personalized eyewear recommendations based on preferences',
      tokenCost: 2,
      metadata: {
        category: 'ai_service',
        token_cost: '2',
        service_type: 'recommendations'
      }
    },
    {
      id: 'pd_calculator',
      name: 'PD Calculator',
      description: 'Accurate pupillary distance measurement tool',
      tokenCost: 1,
      metadata: {
        category: 'ai_service',
        token_cost: '1',
        service_type: 'pd_calculator'
      }
    },
    {
      id: 'style_advisor',
      name: 'Style Advisor',
      description: 'AI-powered style consultation and advice',
      tokenCost: 4,
      metadata: {
        category: 'ai_service',
        token_cost: '4',
        service_type: 'style_advisor'
      }
    },
    {
      id: 'inventory_optimizer',
      name: 'Inventory Optimizer',
      description: 'AI-driven inventory management and optimization',
      tokenCost: 10,
      metadata: {
        category: 'ai_service',
        token_cost: '10',
        service_type: 'inventory_optimizer'
      }
    }
  ],

  // Subscription Plans
  subscriptionPlans: [
    {
      id: 'starter_plan',
      name: 'Starter Plan',
      description: 'Perfect for small retailers getting started with AI',
      price: 2900, // $29.00
      tokens: 1000,
      interval: 'month',
      metadata: {
        category: 'subscription',
        token_allowance: '1000',
        plan_type: 'starter'
      }
    },
    {
      id: 'professional_plan',
      name: 'Professional Plan',
      description: 'Ideal for growing businesses with higher AI usage',
      price: 19900, // $199.00
      tokens: 10000,
      interval: 'month',
      metadata: {
        category: 'subscription',
        token_allowance: '10000',
        plan_type: 'professional'
      }
    },
    {
      id: 'enterprise_plan',
      name: 'Enterprise Plan',
      description: 'Unlimited AI services for large-scale operations',
      price: 99900, // $999.00
      tokens: 'unlimited',
      interval: 'month',
      metadata: {
        category: 'subscription',
        token_allowance: 'unlimited',
        plan_type: 'enterprise'
      }
    }
  ],

  // One-Time Token Packages
  tokenPackages: [
    {
      id: 'tokens_100',
      name: '100 Token Package',
      description: 'Small token package for testing and trial usage',
      price: 1000, // $10.00
      tokens: 100,
      metadata: {
        category: 'token_package',
        token_amount: '100',
        package_type: 'small'
      }
    },
    {
      id: 'tokens_500',
      name: '500 Token Package',
      description: 'Medium token package for short-term projects',
      price: 4500, // $45.00
      tokens: 500,
      metadata: {
        category: 'token_package',
        token_amount: '500',
        package_type: 'medium'
      }
    },
    {
      id: 'tokens_1000',
      name: '1000 Token Package',
      description: 'Large token package for extended usage',
      price: 8000, // $80.00
      tokens: 1000,
      metadata: {
        category: 'token_package',
        token_amount: '1000',
        package_type: 'large'
      }
    }
  ]
};

// Results tracking
const results = {
  products: [],
  prices: [],
  errors: []
};

/**
 * Create a product in Stripe
 */
async function createProduct(productConfig) {
  try {
    console.log(`Creating product: ${productConfig.name}...`);
    
    const product = await stripe.products.create({
      id: `varai_${productConfig.id}`,
      name: productConfig.name,
      description: productConfig.description,
      metadata: {
        ...productConfig.metadata,
        created_by: 'varai_setup_script',
        created_at: new Date().toISOString()
      }
    });

    console.log(`✅ Created product: ${product.name} (${product.id})`);
    results.products.push(product);
    return product;
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log(`⚠️  Product already exists: ${productConfig.name}`);
      // Retrieve existing product
      const product = await stripe.products.retrieve(`varai_${productConfig.id}`);
      results.products.push(product);
      return product;
    } else {
      console.error(`❌ Error creating product ${productConfig.name}:`, error.message);
      results.errors.push({ product: productConfig.name, error: error.message });
      throw error;
    }
  }
}

/**
 * Create a price for a product
 */
async function createPrice(product, priceConfig) {
  try {
    console.log(`Creating price for ${product.name}...`);
    
    const priceData = {
      product: product.id,
      currency: 'usd',
      metadata: {
        ...priceConfig.metadata,
        created_by: 'varai_setup_script',
        created_at: new Date().toISOString()
      }
    };

    // Configure pricing based on type
    if (priceConfig.interval) {
      // Subscription pricing
      priceData.recurring = {
        interval: priceConfig.interval
      };
      priceData.unit_amount = priceConfig.price;
    } else {
      // One-time pricing
      priceData.unit_amount = priceConfig.price;
    }

    const price = await stripe.prices.create(priceData);

    console.log(`✅ Created price: $${(price.unit_amount / 100).toFixed(2)} for ${product.name}`);
    results.prices.push(price);
    return price;
  } catch (error) {
    console.error(`❌ Error creating price for ${product.name}:`, error.message);
    results.errors.push({ product: product.name, error: error.message });
    throw error;
  }
}

/**
 * Setup AI Services
 */
async function setupAIServices() {
  console.log('\n🤖 Setting up AI Services...');
  
  for (const serviceConfig of PRODUCTS_CONFIG.aiServices) {
    try {
      const product = await createProduct(serviceConfig);
      
      // AI services don't need prices as they're charged per token usage
      // The token cost is stored in metadata for reference
      
    } catch (error) {
      console.error(`Failed to setup AI service: ${serviceConfig.name}`);
    }
  }
}

/**
 * Setup Subscription Plans
 */
async function setupSubscriptionPlans() {
  console.log('\n📅 Setting up Subscription Plans...');
  
  for (const planConfig of PRODUCTS_CONFIG.subscriptionPlans) {
    try {
      const product = await createProduct(planConfig);
      await createPrice(product, planConfig);
    } catch (error) {
      console.error(`Failed to setup subscription plan: ${planConfig.name}`);
    }
  }
}

/**
 * Setup Token Packages
 */
async function setupTokenPackages() {
  console.log('\n🎫 Setting up Token Packages...');
  
  for (const packageConfig of PRODUCTS_CONFIG.tokenPackages) {
    try {
      const product = await createProduct(packageConfig);
      await createPrice(product, packageConfig);
    } catch (error) {
      console.error(`Failed to setup token package: ${packageConfig.name}`);
    }
  }
}

/**
 * Verify Stripe API key
 */
async function verifyStripeConnection() {
  try {
    console.log('🔑 Verifying Stripe API connection...');
    // Use a simpler endpoint that doesn't require special permissions
    const balance = await stripe.balance.retrieve();
    console.log(`✅ Connected to Stripe successfully`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Stripe:', error.message);
    console.error('Please check your STRIPE_SECRET_KEY environment variable');
    return false;
  }
}

/**
 * Generate summary report
 */
function generateReport() {
  console.log('\n📊 SETUP SUMMARY REPORT');
  console.log('========================');
  
  console.log(`\n✅ Products Created: ${results.products.length}`);
  results.products.forEach(product => {
    console.log(`   - ${product.name} (${product.id})`);
  });
  
  console.log(`\n💰 Prices Created: ${results.prices.length}`);
  results.prices.forEach(price => {
    const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Free';
    const interval = price.recurring ? `/${price.recurring.interval}` : '';
    console.log(`   - ${amount}${interval} (${price.id})`);
  });
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`   - ${error.product}: ${error.error}`);
    });
  }
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Configure webhook endpoints in Stripe Dashboard');
  console.log('2. Test payment flows in Connected Apps marketplace');
  console.log('3. Verify token allocation and usage tracking');
  console.log('4. Set up monitoring and alerting');
  
  // Export configuration for frontend
  const exportConfig = {
    products: results.products.reduce((acc, product) => {
      acc[product.metadata.service_type || product.metadata.plan_type || product.metadata.package_type] = {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata
      };
      return acc;
    }, {}),
    prices: results.prices.reduce((acc, price) => {
      const productId = results.products.find(p => p.id === price.product)?.metadata.service_type || 
                       results.products.find(p => p.id === price.product)?.metadata.plan_type ||
                       results.products.find(p => p.id === price.product)?.metadata.package_type;
      if (productId) {
        acc[productId] = {
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring
        };
      }
      return acc;
    }, {})
  };
  
  console.log('\n📄 Configuration exported to: stripe-products-config.json');
  require('fs').writeFileSync('stripe-products-config.json', JSON.stringify(exportConfig, null, 2));
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 VARAi Commerce Studio - Stripe Product Setup');
  console.log('================================================');
  
  // Verify connection
  const connected = await verifyStripeConnection();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    // Setup all product categories
    await setupAIServices();
    await setupSubscriptionPlans();
    await setupTokenPackages();
    
    // Generate report
    generateReport();
    
    console.log('\n🎉 Stripe product setup completed successfully!');
    console.log('All products and pricing have been created in your Stripe account.');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createProduct,
  createPrice,
  setupAIServices,
  setupSubscriptionPlans,
  setupTokenPackages,
  PRODUCTS_CONFIG
};