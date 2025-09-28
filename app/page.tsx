// app/page.tsx
import Nav from '@/components/Nav';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Bienvenido</h1>
        <p className="text-gray-600">Usá el menú para gestionar tus pólizas.</p>
      </main>
    </>
  );
}

