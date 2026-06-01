import { UserRole } from "./enums.js";

export interface ITokenPayload {
  userId: string;
  role: UserRole;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}