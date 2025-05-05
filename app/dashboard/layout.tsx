import type React from "react"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">{children}</div>
}
