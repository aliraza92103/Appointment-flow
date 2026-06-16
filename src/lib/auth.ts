import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 
  "appointflow-dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

// In-memory user store (replace with Supabase later)
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  plan: "free" | "pro" | "agency";
  planExpiresAt: string | null;
  remindersUsedThisMonth: number;
  aiMessagesUsedToday: number;
  staffCount: number;
  createdAt: string;
}

export const users: Map<string, User> = new Map([
  [
    "demo@appointflow.com",
    {
      id: "u-demo",
      fullName: "Jane Doe",
      email: "demo@appointflow.com",
      passwordHash: bcrypt.hashSync("Demo1234", 10),
      plan: "pro",
      planExpiresAt: "2027-01-01T00:00:00.000Z",
      remindersUsedThisMonth: 12,
      aiMessagesUsedToday: 3,
      staffCount: 3,
      createdAt: new Date().toISOString(),
    },
  ],
]);

export interface JWTPayload {
  userId: string;
  email: string;
  plan: "free" | "pro" | "agency";
  fullName: string;
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(
  password: string
): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
