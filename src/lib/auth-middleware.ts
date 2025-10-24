import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Verify JWT token
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function authenticateRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return { user: null, error: 'No authentication token' };
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return { user: null, error: 'Invalid authentication token' };
  }

  return {
    user: {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    error: null,
  };
}
