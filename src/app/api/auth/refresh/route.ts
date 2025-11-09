import { NextRequest } from 'next/server';
import { json, handleError } from '../../_lib/http';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '@/lib/auth';
import { findRefreshTokenById, revokeRefreshToken, createRefreshToken, findUserById } from '@/db/queries/users';
import { refreshSchema } from '../../_lib/schemas/auth';

/**
 * Refresh access token
 * @body refreshSchema
 * @response 200:tokenResponseSchema
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = refreshSchema.parse(body);

    // Verify the refresh token JWT
    const payload = await verifyRefreshToken(data.refreshToken);
    if (!payload) {
      return json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // Find the refresh token in the database using the tokenId from the JWT payload
    const tokenId = parseInt(payload.tokenId);
    if (isNaN(tokenId)) {
      return json({ error: 'Invalid token ID' }, { status: 401 });
    }

    const tokenRecord = await findRefreshTokenById(tokenId);
    if (!tokenRecord) {
      return json({ error: 'Refresh token not found' }, { status: 401 });
    }

    // Check if token is revoked
    if (tokenRecord.revokedAt) {
      return json({ error: 'Refresh token has been revoked' }, { status: 401 });
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      return json({ error: 'Refresh token has expired' }, { status: 401 });
    }

    // Find the user
    const user = await findUserById(payload.userId);
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is active
    if (!user.isActive) {
      return json({ error: 'Account is deactivated' }, { status: 403 });
    }

    // Generate new tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshTokenValue = crypto.randomUUID();
    const refreshTokenExpiry = getRefreshTokenExpiry();

    // Create new refresh token
    const newRefreshTokenRecord = await createRefreshToken({
      userId: user.id,
      token: newRefreshTokenValue,
      expiresAt: refreshTokenExpiry,
    });

    const newRefreshToken = await generateRefreshToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      newRefreshTokenRecord.id.toString()
    );

    // Revoke the old refresh token
    await revokeRefreshToken(tokenRecord.id, newRefreshTokenValue);

    return json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return handleError(error);
  }
}
