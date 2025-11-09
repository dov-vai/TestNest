import { NextRequest } from 'next/server';
import { json, badRequest, handleError } from '../../_lib/http';
import {
  validateEmail,
  validatePassword,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from '@/lib/auth';
import { createUser, findUserByEmail, createRefreshToken } from '@/db/queries/users';
import { registerSchema } from '../../_lib/schemas/auth';

/**
 * Register a new user
 * @body registerSchema
 * @response 201:authResponseSchema
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Validate email format
    if (!validateEmail(data.email)) {
      return badRequest('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      return json(
        {
          error: 'Password does not meet requirements',
          issues: passwordValidation.errors,
        },
        { status: 422 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      return json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Create user
    const user = await createUser({
      email: data.email,
      password: data.password,
      name: data.name,
    });

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

    return json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
