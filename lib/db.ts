import "server-only"
import type { User } from "./session"
import crypto from "crypto"

// This is a mock database for demonstration purposes
// In a real application, you would use a real database

type UserWithPassword = User & {
  password: string
}

// In-memory user storage
const users: Record<string, UserWithPassword> = {}

// Hash a password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Create a new user
export async function createUser(email: string, password: string, name: string): Promise<User> {
  // Check if user already exists
  const existingUser = Object.values(users).find((user) => user.email === email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Create a new user
  const id = crypto.randomUUID()
  const hashedPassword = hashPassword(password)

  const user: UserWithPassword = {
    id,
    email,
    name,
    password: hashedPassword,
  }

  users[id] = user

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = Object.values(users).find((user) => user.email === email)
  if (!user) return null

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = Object.values(users).find((user) => user.email === email)
  if (!user) return null

  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) return null

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
