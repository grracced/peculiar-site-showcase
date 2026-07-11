import { Request, Response, NextFunction } from 'express';
import { RegistrationService, RegisterUserDto } from '../../domain/user/services/registration.service';
import { validateData } from '../../utils/validation';
import { UserRegistrationSchema } from '../../domain/user/user.schema';

/**
 * Controller to handle incoming HTTP requests targeting /api/v1/users.
 */
export class UsersController {
  constructor(private readonly registrationService: RegistrationService) {}

  /**
   * HTTP Handler for registering a new user.
   * Exposes POST /api/v1/users.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate payload against UserRegistrationSchema (this will throw ValidationError on failure)
      const registrationDto = validateData<RegisterUserDto>(UserRegistrationSchema, req.body);

      // 2. Delegate creation to domain service
      const userWithProfile = await this.registrationService.register(registrationDto);

      // 3. Return standardized API success response
      res.status(201).json({
        status: 201,
        message: 'User registered successfully',
        data: {
          id: userWithProfile.id,
          email: userWithProfile.email,
          role: userWithProfile.role,
          status: userWithProfile.status,
          emailVerified: userWithProfile.emailVerified,
          createdAt: userWithProfile.createdAt,
          updatedAt: userWithProfile.updatedAt,
          profile: userWithProfile.profile
            ? {
                id: userWithProfile.profile.id,
                fullName: userWithProfile.profile.fullName,
                avatarUrl: userWithProfile.profile.avatarUrl,
                subscriptionTier: userWithProfile.profile.subscriptionTier,
                createdAt: userWithProfile.profile.createdAt,
                updatedAt: userWithProfile.profile.updatedAt,
              }
            : null,
        },
      });
    } catch (err) {
      // Pass errors to the centralized Express errorHandler middleware
      next(err);
    }
  };
}
