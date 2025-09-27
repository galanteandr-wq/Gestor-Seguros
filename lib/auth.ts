import { auth, currentUser } from '@clerk/nextjs/server'

export async function requireUserId(): Promise<string> {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Not authenticated')
  }
  return userId
}

export async function getUser() {
  return currentUser()
}
