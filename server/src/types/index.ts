import { UserRole } from "./enums.js";
import 'multer';

export interface ITokenPayload {
  userId: string;
  role: UserRole;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
      file?: Express.Multer.File;
    }
  }
}