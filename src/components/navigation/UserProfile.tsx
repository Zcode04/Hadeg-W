// components/UserProfile.tsx
import { CircleUserRound } from "lucide-react";

type UserProfileProps = {
  name: string;
};

export default function UserProfile({ name }: UserProfileProps) {
  return (
    <div
      className="flex pr-10  h-10 transition-all space-y-2 duration-200 font-cairo rounded-full bg-gradient-to-tr from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20  border border-gray-300/40 dark:border-gray-600/30   hover:to-green-500 text-white  hover:border-green-700 hover:from-green-400 hover:to-greeen-400 backdrop-blur-sm "
                


    >
      <CircleUserRound className="h-6 w-6 mt-2 absolute inset-y-0 right-2   text-green-400  dark:text-green-50" />
      
      <span className="font-cairo    text-green- mt-2   dark:text-green-400  ">{name}</span>
    </div>
  );
}