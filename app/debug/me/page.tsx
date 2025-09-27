import { getUser } from '@/lib/auth'
export default async function Page() {
  const user = await getUser()
  return (
    <pre className="p-6 text-sm">{JSON.stringify(user, null, 2)}</pre>
  )
}
