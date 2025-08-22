//components/WelcomeScreen.tsx

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const words = [



'مرحبا بيك',
  'معاي ',
  'نفكر',
  'ونحلل ',
  'واقشوا',
  'عصر هون سلم اعلي',




]

export function WelcomeScreen() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex flex-col items-center justify-center   text-center ">
      <Image src="/DHG.svg" alt="Kan Logo" width={500} height={500} className="mb-3" />
      <h1 className="text-2xl text-green-700 font-semibold mb-2 transition-all duration-500">
        {words[currentWordIndex]}
      </h1>

      <Button onClick={() => router.push('/chat')} className="mt-3 px-6 h-8  text-green-300 border-green-600 bg-gradient-to-b from-green-600 to-green-900  rounded-full text-lg">
        شحالك
      </Button>

        <div className='items-center justify-center  w-full'>

      <Button onClick={() => router.push('/login')} className="mt-3 px-6 h-8  text-green-300 border-green-600 bg-gradient-to-b from-green-600 to-green-900  rounded-full text-lg">
        تسجل الدخول
      </Button>
                    

        </div>
    </div>
  )
}