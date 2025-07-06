/**
 * Authentication Service for Admin Panel
 * Handles user authentication and role-based access control
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

// Database connection
let db;
MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/commerce-studio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(client => {
  db = client.db();
  console.log('Connected to MongoDB for auth service');
}).catch(error => {
  console.error('MongoDB connection error:', error);
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user in database
    const user = await db.collection('admin_users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Update last login
    await db.collection('admin_users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
        permissions: user.permissions || []
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token verification endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await db.collection('admin_users').findOne({ 
      _id: decoded.id,
      active: true 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
        permissions: user.permissions || []
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a more sophisticated setup, you might maintain a blacklist of tokens
  // For now, we'll just return success and let the client handle token removal
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('admin_users').findOne(
      { _id: req.user.id },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updateData.updatedAt = new Date();
    
    const result = await db.collection('admin_users').updateOne(
      { _id: req.user.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    // Get current user
    const user = await db.collection('admin_users').findOne({ _id: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.collection('admin_users').updateOne(
      { _id: req.user.id },
      { 
        $set: { 
          password: hashedPassword,
          passwordChangedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get clients list (super admin only)
router.get('/clients', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const clients = await db.collection('clients').find(
      { active: true },
      { projection: { _id: 1, name: 1, email: 1, createdAt: 1 } }
    ).toArray();
    
    res.json({
      success: true,
      data: clients.map(client => ({
        id: client._id,
        name: client.name,
        email: client.email,
        createdAt: client.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Clients fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware functions
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Initialize default admin user if none exists
async function initializeDefaultAdmin() {
  try {
    const adminCount = await db.collection('admin_users').countDocuments({ role: 'super_admin' });
    
    if (adminCount === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await db.collection('admin_users').insertOne({
        email: 'admin@commercestudio.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        active: true,
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Default admin user created with email: admin@commercestudio.com');
      console.log(`Default password: ${defaultPassword}`);
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
}

// Initialize default admin when database connection is established
if (db) {
  initializeDefaultAdmin();
} else {
  // Wait for database connection
  setTimeout(initializeDefaultAdmin, 2000);
}

module.exports = router;