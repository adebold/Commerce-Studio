import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { JwtService } from '../../services/jwtService';

// Mock the config
jest.mock('../../config/index', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key',
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d',
    },
  },
}));

describe('JwtService', () => {
  const mockPayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    roles: ['user'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct payload in token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.verifyAccessToken(token) as any;
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.roles).toEqual(mockPayload.roles);
      expect(decoded.type).toBe('access');
    });

    it('should set correct expiration time', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.verifyAccessToken(token);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp! > decoded.iat!).toBe(true);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = JwtService.generateRefreshToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct type in refresh token', () => {
      const token = JwtService.generateRefreshToken();
      const decoded = JwtService.verifyRefreshToken(token) as any;
      
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        JwtService.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for refresh token used as access token', () => {
      const refreshToken = JwtService.generateRefreshToken();
      
      expect(() => {
        JwtService.verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        JwtService.verifyAccessToken('not.a.jwt');
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = JwtService.generateRefreshToken();
      const decoded = JwtService.verifyRefreshToken(token) as any;
      
      expect(decoded).toBeDefined();
      expect(decoded.type).toBe('refresh');
    });

    it('should throw error for access token used as refresh token', () => {
      const accessToken = JwtService.generateAccessToken(mockPayload);
      
      expect(() => {
        JwtService.verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        JwtService.verifyRefreshToken('invalid-token');
      }).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token';
      const header = `Bearer ${token}`;
      
      const extracted = JwtService.extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = JwtService.extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid header format', () => {
      const extracted = JwtService.extractTokenFromHeader('Invalid header');
      expect(extracted).toBeNull();
    });

    it('should return null for non-Bearer header', () => {
      const extracted = JwtService.extractTokenFromHeader('Basic token');
      expect(extracted).toBeNull();
    });

    it('should handle header with extra spaces', () => {
      const token = 'test-token';
      const header = `  Bearer   ${token}  `;
      
      const extracted = JwtService.extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });
  });

  describe('getAccessTokenExpirySeconds', () => {
    it('should return correct expiry seconds', () => {
      const seconds = JwtService.getAccessTokenExpirySeconds();
      expect(seconds).toBe(15 * 60); // 15 minutes in seconds
    });
  });

  describe('edge cases', () => {
    it('should handle empty payload', () => {
      const emptyPayload = {
        userId: '',
        email: '',
        roles: [],
      };
      
      const token = JwtService.generateAccessToken(emptyPayload);
      const decoded = JwtService.verifyAccessToken(token);
      
      expect(decoded.userId).toBe('');
      expect(decoded.email).toBe('');
      expect(decoded.roles).toEqual([]);
    });

    it('should handle payload with special characters', () => {
      const specialPayload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test+special@example.com',
        roles: ['user', 'admin'],
      };
      
      const token = JwtService.generateAccessToken(specialPayload);
      const decoded = JwtService.verifyAccessToken(token);
      
      expect(decoded.email).toBe(specialPayload.email);
      expect(decoded.roles).toEqual(specialPayload.roles);
    });
  });

  describe('security tests', () => {
    it('should not accept tokens signed with different secret', () => {
      // This would require mocking jwt.sign with different secret
      // For now, we test that verification fails with tampered tokens
      const token = JwtService.generateAccessToken(mockPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      expect(() => {
        JwtService.verifyAccessToken(tamperedToken);
      }).toThrow();
    });

    it('should validate token structure', () => {
      const invalidTokens = [
        '',
        'a',
        'a.b',
        'a.b.c.d',
        'not-a-jwt-token',
      ];

      invalidTokens.forEach(invalidToken => {
        expect(() => {
          JwtService.verifyAccessToken(invalidToken);
        }).toThrow();
      });
    });
  });
});