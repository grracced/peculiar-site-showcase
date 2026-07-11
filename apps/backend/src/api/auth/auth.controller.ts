import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../domain/user/services/auth.service';
import { validateData } from '../../utils/validation';
import { LoginSchema, LoginInput, AuthResponseSchema } from '../../domain/user/user.schema';

/**
 * Controller to handle incoming HTTP requests targeting /api/v1/auth.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * HTTP Handler for credentials-based user login.
   * Exposes POST /api/v1/auth/login.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate payload against LoginSchema
      const loginDto = validateData<LoginInput>(LoginSchema, req.body);

      // 2. Delegate authentication to service layer
      const userWithProfile = await this.authService.login(loginDto);

      // 3. Construct and validate outgoing DTO
      const authResponse = AuthResponseSchema.parse({
        userId: userWithProfile.id,
        email: userWithProfile.email,
        fullName: userWithProfile.profile?.fullName ?? '',
        role: userWithProfile.role,
        emailVerified: userWithProfile.emailVerified,
      });

      // 4. Return standardized API success response
      res.status(200).json({
        status: 200,
        message: 'User logged in successfully',
        data: authResponse,
      });
    } catch (err) {
      // Forward authentication exceptions (e.g. InvalidCredentialsError) to errorHandler middleware
      next(err);
    }
  };
}
