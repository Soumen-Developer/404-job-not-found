import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LoginRequest, AuthResponse } from './auth.controller';
import { UserDto } from './dto/user.dto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export class AuthService {
  public async login(req: LoginRequest): Promise<AuthResponse> {
    const { email, password } = req;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Usually you would sign a JWT here. Using a mock token for now.
    // e.g. const token = fastify.jwt.sign({ userId: user.id });
    const token = `mock-jwt-token-for-${user.id}`;

    // Return user data without sensitive information
    const userDto = new UserDto({
      id: user.id,
      email: user.email,
      githubUsername: user.githubUsername, // Keep as null if null from DB
      role: user.role
    });

    return {
      token,
      userId: user.id,
      user: userDto,
    };
  }
}
