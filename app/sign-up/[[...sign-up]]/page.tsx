'use client'
import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen grid place-items-center">
      <SignUp routing="path" path="/sign-up" />
    </div>
  )
}
