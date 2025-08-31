
// ✅ 6. src/app/page.tsx
export const runtime = 'edge';

import { lazy, Suspense } from 'react';

const WelcomeScreen = lazy(() => import('@/components/WelcomeSCreen'));

function WelcomeLoadingSpinner() {
  return (
    <div className="bg-gray-900 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-green-600/20 rounded-full mb-4"></div>
          <div className="h-6 bg-green-600/20 rounded w-48 mb-4"></div>
          <div className="h-8 bg-green-600/20 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-gray-900 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Suspense fallback={<WelcomeLoadingSpinner />}>
          <WelcomeScreen />
        </Suspense>
      </div>
    </div>
  );
}
