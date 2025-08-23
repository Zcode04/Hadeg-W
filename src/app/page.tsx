//src/app>paget.tsx

export const runtime = 'edge';

import { WelcomeScreen } from '@/components/WelcomeSCreen'


export default function HomePage() {
  return (
   <div className="bg-gray-900  flex min-h-svh flex-col items-center justify-center p-6 md:p-10">


                    
        <div className="w-full max-w-sm md:max-w-3xl">
          
               <WelcomeScreen /> 


        </div>

      </div>
  )
}