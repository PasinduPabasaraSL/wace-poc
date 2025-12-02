"use server"

import { signIn, signOut } from "@/auth"
import { redirect } from "next/navigation"

export async function authenticate(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    redirect("/dashboard")
  } catch (error) {
    throw error
  }
}

export async function logout() {
  await signOut({ redirect: false })
  redirect("/login")
}

