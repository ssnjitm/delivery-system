import { validateBody } from '@/middlewares/validation.js';
import { UserRole } from '@/types/enums.js';
import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from './controller.js';


const authRoutes = Router();

// E.164 Clean International Phone Schema Format Pattern Matcher 
const cleanPhone = z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Must match valid international E.164 phone formats.' });
const clearPassword = z.string().min(8, { message: 'Password constraints require a minimum of 8 safe characters.' });

// Shared Base Login Schema Definition [cite: 174]
const LoginPayload = z.object({
  phone: cleanPhone,
  password: clearPassword
});

//  Vendor Spec Payload Verification Schema [cite: 147, 148]
const VendorSignupPayload = z.object({
  phone: cleanPhone,
  password: clearPassword,
  role: z.literal(UserRole.VENDOR),
  businessName: z.string().min(2).max(120),
  ownerName: z.string().min(2).max(120),
  address: z.string().min(4),
  coordinates: z.array(z.number()).length(2, { message: 'Coordinates array must map exactly as [longitude, latitude]' }),
  citizenshipDocUrl: z.string().url()
});

//  Driver Spec Payload Verification Schema [cite: 162, 167]
const DriverSignupPayload = z.object({
  phone: cleanPhone,
  password: clearPassword,
  role: z.literal(UserRole.DRIVER),
  fullName: z.string().min(2).max(100),
  citizenshipDocUrl: z.string().url(),
  drivingLicenseUrl: z.string().url(),
  bikeModel: z.string().min(1),
  bluebookUrl: z.string().url(),
  selfieUrl: z.string().url(),
  emergencyContact: z.object({
    name: z.string().min(2),
    phone: cleanPhone
  })
});

//  Customer / Normal User Spec Payload Verification Schema [cite: 155, 157]
const ConsumerSignupPayload = z.object({
  phone: cleanPhone,
  password: clearPassword,
  role: z.enum([UserRole.CUSTOMER, UserRole.NORMAL_USER]),
  fullName: z.string().min(2),
  selfieUrl: z.string().url(),
  email: z.string().email().optional(),
  defaultDeliveryAddress: z.string().optional()
});

// Declare Express Endpoints with their explicit runtime payload boundaries
authRoutes.post('/register/vendor', validateBody(VendorSignupPayload), AuthController.register);
authRoutes.post('/register/driver', validateBody(DriverSignupPayload), AuthController.register);
authRoutes.post('/register/customer', validateBody(ConsumerSignupPayload), AuthController.register);
authRoutes.post('/register/user', validateBody(ConsumerSignupPayload), AuthController.register);

authRoutes.post('/login', validateBody(LoginPayload), AuthController.login);

export default authRoutes;