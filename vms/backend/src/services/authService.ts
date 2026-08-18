import bcrypt from 'bcryptjs';
import { PrismaClient, type Role as PrismaRole } from '@prisma/client';
import { signToken } from '../utils/jwt.js';
import type { AuthUser, Role } from '../types/auth.js';

const prisma = new PrismaClient();

const prismaRoleMap: Record<Role, PrismaRole> = {
  VENDOR: 'VENDOR',
  CONTRACTOR: 'CONTRACTOR',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
};

export const registerUser = async (input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: prismaRoleMap[input.role],
    },
  });

  return {
    user: serializeUser(user),
    token: signToken(user.id, user.role as Role),
  };
};

export const loginUser = async (input: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return {
    user: serializeUser(user),
    token: signToken(user.id, user.role as Role),
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user ? serializeUser(user) : null;
};

const serializeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: PrismaRole;
}): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as Role,
});
