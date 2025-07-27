import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { TokenPayload } from '../types/interfaces';

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  // Fixed: Direct string assignment without SignOptions interface
  return jwt.sign(payload, secret, {
    expiresIn: '15m', // Direct string value
    issuer: 'crypto-platform',
    audience: 'crypto-platform-users'
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  // Fixed: Direct string assignment without SignOptions interface
  return jwt.sign(payload, secret, {
    expiresIn: '7d', // Direct string value
    issuer: 'crypto-platform',
    audience: 'crypto-platform-users'
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const decoded = jwt.verify(token, secret, {
    issuer: 'crypto-platform',
    audience: 'crypto-platform-users'
  });

  return decoded as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  const decoded = jwt.verify(token, secret, {
    issuer: 'crypto-platform',
    audience: 'crypto-platform-users'
  });

  return decoded as TokenPayload;
};

export const setTokenCookie = (res: Response, token: string, type: 'access' | 'refresh' = 'access'): void => {
  const cookieName = type === 'access' ? 'accessToken' : 'refreshToken';
  const maxAge = type === 'access' ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/'
  });
};

export const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
