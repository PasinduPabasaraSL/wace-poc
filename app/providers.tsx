"use client"

export function Providers({ children }: { children: React.ReactNode }) {
  // NextAuth v5 handles sessions server-side, no client provider needed
  return <>{children}</>
}

