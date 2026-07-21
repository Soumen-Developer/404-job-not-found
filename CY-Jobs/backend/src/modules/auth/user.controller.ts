import { Body, Controller, Get, Path, Patch, Route, Tags } from 'tsoa';
import { UserDto } from './dto/user.dto';
import { PrismaClient } from '@prisma/client';

interface UpdateGithubUsernameRequest {
  githubUsername: string;
}

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  private prisma = new PrismaClient();

  /**
   * Get user profile by ID
   */
  @Get('{userId}')
  public async getUserProfile(
    @Path() userId: string
  ): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }

    const userDto = new UserDto({
      id: user.id,
      email: user.email,
      githubUsername: user.githubUsername ?? null,
      role: user.role
    });

    return userDto;
  }

  /**
   * Update GitHub username for a user
   */
  @Patch('{userId}/github')
  public async updateGithubUsername(
    @Path() userId: string,
    @Body() requestBody: UpdateGithubUsernameRequest
  ): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        githubUsername: requestBody.githubUsername,
      },
    });

    const userDto = new UserDto({
      id: user.id,
      email: user.email,
      githubUsername: user.githubUsername ?? null,
      role: user.role
    });

    return userDto;
  }
}