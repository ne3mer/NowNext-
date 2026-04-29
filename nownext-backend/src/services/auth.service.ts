import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/appError';
import { signToken } from '../utils/jwt';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  const exists = await UserModel.findOne({ email: input.email }).lean();
  if (exists) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  const token = signToken({ userId: user._id.toString() });
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ userId: user._id.toString() });
  const safeUser = user.toObject();
  delete (safeUser as { passwordHash?: string }).passwordHash;
  return { user: safeUser, token };
}

export async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}
