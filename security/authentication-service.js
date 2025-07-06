/**
 * @fileoverview Advanced authentication service for the AI Avatar Chat System.
 * Implements JWT, OAuth2, and Multi-Factor Authentication (MFA).
 * @module security/authentication-service
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Load security policies
const securityPolicies = yaml.load(fs.readFileSync(path.resolve(__dirname, '../config/security/security-policies.yaml'), 'utf8'));
const jwtConfig = securityPolicies.jwt;
const oauthConfig = securityPolicies.oauth2.providers.google;

const googleClient = new OAuth2Client(oauthConfig.client_id);

/**
 * Manages authentication, including JWT, OAuth2, and MFA.
 */
class AuthenticationService {
  /**
   * Generates a JWT access token.
   * @param {object} payload - The payload to include in the token.
   * @returns {string} The generated JWT access token.
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      expiresIn: jwtConfig.access_token_expires_in,
      algorithm: jwtConfig.algorithm,
    });
  }

  /**
   * Generates a JWT refresh token.
   * @param {object} payload - The payload to include in the token.
   * @returns {string} The generated JWT refresh token.
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      expiresIn: jwtConfig.refresh_token_expires_in,
      algorithm: jwtConfig.algorithm,
    });
  }

  /**
   * Verifies a JWT token.
   * @param {string} token - The JWT token to verify.
   * @returns {object} The decoded payload if verification is successful.
   * @throws {Error} If the token is invalid or expired.
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithms: [jwtConfig.algorithm],
      });
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      throw new Error('Invalid or expired token.');
    }
  }

  /**
   * Initiates an OAuth2 flow with Google.
   * @returns {string} The Google OAuth2 consent screen URL.
   */
  initiateGoogleOAuth() {
    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: oauthConfig.scopes,
    });
    return authUrl;
  }

  /**
   * Handles the Google OAuth2 callback.
   * @param {string} code - The authorization code from Google.
   * @returns {Promise<object>} A promise that resolves with the user's profile information.
   */
  async handleGoogleOAuthCallback(code) {
    try {
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: oauthConfig.client_id,
      });
      const payload = ticket.getPayload();
      return {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
      };
    } catch (error) {
      console.error('Google OAuth callback error:', error.message);
      throw new Error('Failed to authenticate with Google.');
    }
  }

  /**
   * Generates a TOTP secret for MFA.
   * @returns {object} An object containing the ascii, hex, and base32 secrets, and the otpauth_url.
   */
  generateTotpSecret() {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: securityPolicies.mfa.totp_issuer,
    });
    return secret;
  }

  /**
   * Verifies a TOTP token.
   * @param {string} secret - The base32 secret for the user.
   * @param {string} token - The TOTP token to verify.
   * @returns {boolean} True if the token is valid, false otherwise.
   */
  verifyTotpToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });
  }
}

module.exports = new AuthenticationService();