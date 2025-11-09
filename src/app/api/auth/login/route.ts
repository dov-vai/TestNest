import { NextRequest } from 'next/server';
import { json, handleError } from '../../_lib/http';
import { verifyPassword, generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/lib/auth';
import { findUserByEmail, createRefreshToken } from '@/db/queries/users';
import { loginSchema } from '../../_lib/schemas/auth';

/**
 * Login
 * @body loginSchema
 * @response 200:authResponseSchema
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find user
    const user = await findUserByEmail(data.email);
    if (!user) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return json({ error: 'Account is deactivated' }, { status: 403 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenValue = crypto.randomUUID();
    const refreshTokenExpiry = getRefreshTokenExpiry();

    const refreshTokenRecord = await createRefreshToken({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: refreshTokenExpiry,
    });

    const refreshToken = await generateRefreshToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      refreshTokenRecord.id.toString()
    );

    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return handleError(error);
  }
}
