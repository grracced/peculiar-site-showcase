import { User } from '../domain/user/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}
export {};
