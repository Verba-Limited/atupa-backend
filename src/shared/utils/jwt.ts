import jwt from 'jsonwebtoken';
import { AuthTokens } from '../types';

export class JwtUtil {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'atupa_secret_key';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'atupa_refresh_secret';
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  static generateTokens(payload: object): AuthTokens {
    const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    } as jwt.SignOptions);

    return {
      accessToken: accessToken as string,
      refreshToken: refreshToken as string,
      expiresIn: this.getExpiresInSeconds(this.ACCESS_TOKEN_EXPIRES_IN)
    };
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  private static getExpiresInSeconds(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 24 * 60 * 60; // 24 hours default
    }
  }
}
