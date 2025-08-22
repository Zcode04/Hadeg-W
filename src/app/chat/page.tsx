//src/app/Chat>paget.tsx


export const runtime = 'edge';           // Edge Function
export const dynamic = 'force-dynamic';  // SSR عند كل طلب

import ChatLayout from '@/components/layouts/ChatLayout';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Shell SSR سريع */}
      <div>
        <div className="">
          {/* ChatLayout هو مكون Client فقط */}
          <ChatLayout />
        </div>
      </div>
    </main>
  );
}
// أضف في بداية chat/page.tsx
console.log('Chat page loaded');