import AuthShowcase from '@/components/AuthShowcase';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center justify-center w-full">
        <AuthShowcase />
      </main>
    </div>
  );
}
