import "server-only"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

// This would be an environment variable in production
const secretKey = "your-secret-key-min-32-chars-long-here"
const key = new TextEncoder().encode(secretKey)

export type User = {
  id: string
  email: string
  name: string
}

export type SessionData = {
  user: User
  expires: number
}

// Create a session
export async function createSession(user: User) {
  const expiresIn = 60 * 60 * 24 * 7 // 1 week
  const expires = Date.now() + expiresIn * 1000

  const session = await new SignJWT({ user, expires })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)

  cookies().set("session", session, {
    httpOnly: true,
    expires: new Date(expires),
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  return { user, expires }
}

// Get the session
export async function getSession(): Promise<SessionData | null> {
  const session = cookies().get("session")?.value

  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    })

    const { user, expires } = payload as SessionData

    // Check if session has expired
    if (expires < Date.now()) {
      return null
    }

    return { user, expires }
  } catch (error) {
    return null
  }
}

// Delete the session
export async function deleteSession() {
  cookies().set("session", "", {
    expires: new Date(0),
    path: "/",
  })
}
