import { Route, Post, Body, Tags, Controller } from 'tsoa';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  user: UserDto;
}

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * Login with email and password
   */
  @Post('login')
  public async login(@Body() requestBody: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await this.authService.login(requestBody);
      return result;
    } catch (err: any) {
      this.setStatus(401);
      throw new Error(err.message || 'Invalid credentials');
    }
  }
}
