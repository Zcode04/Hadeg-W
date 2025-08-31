// ✅ 7. src/app/chat/page.tsx - تحميل شامير احترافي متجاوب
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { lazy, Suspense } from 'react';

const ChatLayout = lazy(() => import('@/components/layouts/ChatLayout'));

// تأثير الشامير الاحترافي
function Shimmer({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div 
      className={`relative overflow-hidden bg-gray-200 dark:bg-green-400 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-300/10" />
    </div>
  );
}

// تجربة تحميل دردشة احترافية متجاوبة
function ProfessionalChatLoader() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col md:flex-row">
      
      {/* الشريط الجانبي الأنيق - مخفي على الهواتف، مرئي على الشاشات الكبيرة */}
      <div className="hidden md:block w-full md:w-64 lg:w-72 xl:w-80 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700/50 p-3 sm:p-4 lg:p-6">
        {/* زر دردشة جديدة */}
        <Shimmer className="h-10 sm:h-11 rounded-lg mb-4 lg:mb-6" delay={100} />
        
        {/* المحادثات الأخيرة */}
        <div className="space-y-2 lg:space-y-3">
          <Shimmer className="h-3 sm:h-4 w-16 sm:w-20 rounded" delay={200} />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="group">
              <Shimmer className="h-8 sm:h-9 w-full rounded-lg mb-1" delay={300 + i * 100} />
              <Shimmer className="h-2.5 sm:h-3 w-2/3 sm:w-3/4 rounded ml-2" delay={350 + i * 100} />
            </div>
          ))}
        </div>
        
        {/* القسم السفلي */}
        <div className="absolute bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6 right-3 sm:right-4 lg:right-6">
          <Shimmer className="h-9 sm:h-10 rounded-lg" delay={900} />
        </div>
      </div>

      {/* واجهة الدردشة الرئيسية */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* الرأس النظيف - متجاوب */}
        <header className="border-b border-gray-200 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* زر القائمة للهواتف */}
              <div className="md:hidden">
                <Shimmer className="w-8 h-8 rounded-lg" delay={25} />
              </div>
              <Shimmer className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" delay={50} />
              <div className="space-y-1">
                <Shimmer className="h-4 sm:h-5 w-24 sm:w-32 rounded" delay={100} />
                <Shimmer className="h-2.5 sm:h-3 w-16 sm:w-20 rounded" delay={150} />
              </div>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Shimmer className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" delay={200} />
              <Shimmer className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" delay={250} />
            </div>
          </div>
        </header>

        {/* حاوية الرسائل - متجاوبة */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* قسم الترحيب - متجاوب */}
            <div className="text-center space-y-3 sm:space-y-4">
              <Shimmer className="h-6 sm:h-7 lg:h-8 w-48 sm:w-56 lg:w-64 rounded-lg mx-auto" delay={100} />
              <Shimmer className="h-3 sm:h-4 w-64 sm:w-80 lg:w-96 rounded mx-auto" delay={200} />
            </div>

            {/* تدفق المحادثة - متجاوب */}
            
            {/* رسالة المستخدم */}
            <div className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-xs lg:max-w-md space-y-2">
                <Shimmer className="h-3.5 sm:h-4 w-full rounded" delay={300} />
                <Shimmer className="h-3.5 sm:h-4 w-3/4 sm:w-4/5 rounded" delay={350} />
              </div>
            </div>

            {/* رد الذكاء الاصطناعي - متجاوب */}
            <div className="flex space-x-2 sm:space-x-3 lg:space-x-4">
              <Shimmer className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full mt-1 flex-shrink-0" delay={400} />
              <div className="flex-1 max-w-full sm:max-w-2xl lg:max-w-3xl space-y-2 sm:space-y-3">
                <Shimmer className="h-3.5 sm:h-4 w-full rounded" delay={450} />
                <Shimmer className="h-3.5 sm:h-4 w-full rounded" delay={500} />
                <Shimmer className="h-3.5 sm:h-4 w-2/3 sm:w-3/4 rounded" delay={550} />
                
                {/* محاكاة كتلة الكود - متجاوبة */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 space-y-2">
                  <Shimmer className="h-2.5 sm:h-3 w-1/4 rounded" delay={600} />
                  <Shimmer className="h-2.5 sm:h-3 w-full rounded" delay={650} />
                  <Shimmer className="h-2.5 sm:h-3 w-4/5 sm:w-5/6 rounded" delay={700} />
                  <Shimmer className="h-2.5 sm:h-3 w-2/3 sm:w-3/4 rounded" delay={750} />
                </div>
                
                <Shimmer className="h-3.5 sm:h-4 w-1/2 sm:w-2/3 rounded" delay={800} />
              </div>
            </div>

            {/* رسالة أخرى من المستخدم */}
            <div className="flex justify-end">
              <Shimmer className="h-3.5 sm:h-4 w-32 sm:w-40 rounded" delay={850} />
            </div>

            {/* الذكاء الاصطناعي يفكر - متجاوب */}
            <div className="flex space-x-2 sm:space-x-3 lg:space-x-4">
              <Shimmer className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full mt-1 flex-shrink-0" delay={900} />
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <Shimmer className="h-2.5 sm:h-3 w-12 sm:w-16 rounded" delay={950} />
              </div>
            </div>

            {/* مساحة إضافية للهواتف */}
            <div className="h-4 sm:h-6 md:hidden" />

          </div>
        </div>

        {/* منطقة إدخال متطورة - متجاوبة */}
        <div className="border-t border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 sticky bottom-0">
          <div className="max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto">
            <div className="flex items-end space-x-2 sm:space-x-3">
              {/* زر المرفق */}
              <Shimmer className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" delay={100} />
              
              {/* حقل الإدخال */}
              <div className="flex-1 relative">
                <Shimmer className="h-10 sm:h-11 lg:h-12 rounded-xl sm:rounded-2xl" delay={150} />
                {/* زر الإرسال من الداخل */}
                <div className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2">
                  <Shimmer className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" delay={200} />
                </div>
              </div>
            </div>
            
            {/* معلومات التذييل - متجاوبة */}
            <div className="flex flex-col sm:flex-row items-center justify-center mt-2 sm:mt-3 space-y-1 sm:space-y-0 sm:space-x-4">
              <Shimmer className="h-2.5 sm:h-3 w-20 sm:w-24 rounded" delay={250} />
              <div className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <Shimmer className="h-2.5 sm:h-3 w-24 sm:w-32 rounded" delay={300} />
            </div>
          </div>
        </div>

      </div>

      {/* شريط جانبي منزلق للهواتف (تحضير للمستقبل) */}
      <div className="md:hidden fixed inset-0 z-50 hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          {/* محتوى الشريط الجانبي للهواتف */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-6 w-24 rounded" delay={50} />
              <Shimmer className="w-8 h-8 rounded-lg" delay={100} />
            </div>
            <Shimmer className="h-10 rounded-lg" delay={150} />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <Shimmer className="h-8 w-full rounded-lg mb-1" delay={200 + i * 50} />
                  <Shimmer className="h-2.5 w-3/4 rounded ml-2" delay={225 + i * 50} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <main className="min-h-screen w-full">
      <Suspense fallback={<ProfessionalChatLoader />}>
        <ChatLayout />
      </Suspense>
    </main>
  );
}
