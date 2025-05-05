"use server"

import { createUser, verifyCredentials } from "./db"
import { createSession, deleteSession } from "./session"
import { redirect } from "next/navigation"
import { z } from "zod"

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Signup action
export async function signup(prevState: any, formData: FormData) {
  // Validate form data
  const validatedFields = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields. Failed to sign up.",
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    // Create user
    const user = await createUser(email, password, name)

    // Create session
    await createSession(user)

    // Redirect to dashboard
    redirect("/dashboard")
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
    }
  }
}

// Login action
export async function login(prevState: any, formData: FormData) {
  // Validate form data
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields. Failed to log in.",
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Verify credentials
    const user = await verifyCredentials(email, password)

    if (!user) {
      return {
        message: "Invalid email or password.",
      }
    }

    // Create session
    await createSession(user)

    // Redirect to dashboard
    redirect("/dashboard")
  } catch (error) {
    return {
      message: "Something went wrong. Please try again.",
    }
  }
}

// Logout action
export async function logout() {
  await deleteSession()
  redirect("/")
}
