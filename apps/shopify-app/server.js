require('dotenv').config();
const express = require('express');
const session = require('express-session');
// NOTE: Run 'npm install connect-mongo --save' to install this package
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    // Use MongoDB for session storage instead of MemoryStore
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24, // 1 day
      autoRemove: 'native'
    })
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((err) => {
  logger.error('MongoDB connection error:', err);
});

// Initialize client portal authentication (commented out for now)
// (async () => {
//   try {
//     await setClientPortalAuth();
//     logger.info('Client portal authentication initialized');
//   } catch (error) {
//     logger.error(`Failed to initialize client portal authentication: ${error.message}`);
//   }
// })();

// Routes
// Commented out for now until we fix the Shopify API issues
// app.use('/auth', authRoutes);
// app.use('/webhooks', webhookRoutes);
// app.use('/products', productRoutes);
// app.use('/settings', settingsRoutes);

// Reporting API Routes
const reportsApi = require('./src/reporting/api/reports');
const reportTemplatesApi = require('./src/reporting/api/reportTemplates');
const reportConfigurationsApi = require('./src/reporting/api/reportConfigurations');

app.use('/api/reports', reportsApi);
app.use('/api/report-templates', reportTemplatesApi);
app.use('/api/report-configurations', reportConfigurationsApi);

// Root route
app.get('/', (req, res) => {
  res.send('EyewearML Shopify App is running!');
});

// Client portal proxy route (commented out for now)
// app.use('/api/client-portal', async (req, res, next) => {
//   try {
//     // Ensure client portal authentication is set
//     await setClientPortalAuth();
//     next();
//   } catch (error) {
//     logger.error(`Client portal auth error: ${error.message}`);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
// To suppress the punycode deprecation warning, you can run the app with:
// NODE_OPTIONS="--no-deprecation" npm start
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;