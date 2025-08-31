// ✅ 5. components/WelcomeScreen.tsx
'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const WORDS = [
  'مرحبا بيك',
  'معاي',
  'نفكر',
  'ونحلل',
  'واقشوا',
  'عصر هون سلم اعلي',
] as const;

export default function WelcomeScreen() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const router = useRouter();

  const navigateToChat = useCallback(() => {
    router.push('/chat');
  }, [router]);

  const navigateToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentWord = useMemo(() => WORDS[currentWordIndex], [currentWordIndex]);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <Image
        src="/DHG.svg"
        alt="Kan Logo"
        width={500}
        height={500}
        className="mb-3"
        priority
        sizes="500px"
      />
      
      <h1 className="text-2xl text-green-700 font-semibold mb-2 transition-all duration-500 min-h-[2rem]">
        {currentWord}
      </h1>

      <div className="flex flex-col items-center justify-center w-full gap-3 mt-3">
        <Button
          onClick={navigateToChat}
          className="px-6 h-8 text-green-300 border-green-600 bg-gradient-to-b from-green-600 to-green-900 rounded-full text-lg hover:from-green-700 hover:to-green-800 transition-colors"
        >
          شحالك
        </Button>

        <Button
          onClick={navigateToLogin}
          className="px-6 h-8 text-green-300 border-green-600 bg-gradient-to-b from-green-600 to-green-900 rounded-full text-lg hover:from-green-700 hover:to-green-800 transition-colors"
        >
          تسجل الدخول
        </Button>
      </div>
    </div>
  );
}