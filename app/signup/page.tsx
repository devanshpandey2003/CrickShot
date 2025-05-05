"use client"

import { SignupForm } from "./signup-form"
import { Target } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-background p-8 shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-2xl font-bold text-green-800">CrickBoost</h1>
          </div>
          <h2 className="text-xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-green-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
