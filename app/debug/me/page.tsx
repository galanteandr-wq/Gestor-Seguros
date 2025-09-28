// app/debug/me/page.tsx
import { auth, currentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DebugMePage() {
  const { userId } = auth();
  const user = await currentUser();

  return (
    <pre className="p-4 text-xs bg-gray-50 rounded border overflow-auto">
      {JSON.stringify({ userId, user }, null, 2)}
    </pre>
  );
}
