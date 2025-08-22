// components/navigation/Header.tsx (الإصدار المصحَّح)
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onLogin?: () => void;
  onLogout?: () => void;
  userName?: string;
  isLoggedIn?: boolean;
  currentModel?: string;
  onModelChange?: (model: string) => void;
  toggleSidebar?: () => void;
}

// Profile Dropdown Component
const ProfileDropdown = () => (
  <DropdownMenu />
);

// Model Selector Component
const ModelSelector = ({
  currentModel,
  onModelChange,
}: {
  currentModel?: string;
  onModelChange?: (model: string) => void;
}) => {
  const { theme } = useTheme();

  // قيم فريدة لكل نموذج
  const availableModels = [
    { value: 'Hadg-W', label: 'Hadg-W' },
    { value: 'hadeg-1-2', label: 'hadeg-1.2' },
    { value: 'hadeg-2', label: 'hadeg-2' },
    { value: 'hadeg-3', label: 'hadeg-3' },
  ];

  return (
    <Select value={currentModel} onValueChange={onModelChange}  >
      <SelectTrigger
        className={`w-23 sm:w-28 md:w-24 h-10 transition-all duration-300 backdrop-blur-sm border rounded-full hover:shadow-xl hover:scale-105 text-xs  ${
          theme === 'dark'
            ? 'bg-gradient-to-tr from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30  hover:from-green-400/30 hover:to-green-600/30 text-white  hover:border-green-300/40 dark:text-green-50'
            : 'bg-gradient-to-tl from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30  hover:from-green-600 hover:to-green-500 text-white  hover:border-green-700'
        }`}
      >
        <SelectValue placeholder="اختر النموذج" />
      </SelectTrigger>

               <SelectContent className={`transition-all duration-300 backdrop-blur-sm border rounded-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-tr from-violet-700 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30'
          : 'bg-gradient-to-tr from-violet-700 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30'
      }`}>
        {availableModels.map(({ value, label }) => (
          <SelectItem 
            key={value} 
            value={value} 
            className={`text-xs transition-all duration-200 rounded-md ${
              theme === 'dark'
                ? 'hover:bg-green-400/20 hover:text-green-200 text-green-50 focus:bg-green-400/30'
                : 'hover:bg-green-600/20 hover:text-green-100 text-gray-100 focus:bg-green-600/30'
            }`}
          >
            {label}
          </SelectItem>
        ))}
      </SelectContent>





    </Select>




  );
};

export function Header({
  
  


  currentModel = 'Hadg-W',
  onModelChange,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-500 ${theme === 'dark' ? '' : ''}`}
        />
        <div className="absolute inset-0 backdrop-blur-sm  bg-gradient-to    from-blue-950 to-gray-950" />
        <div
          className={`absolute bottom-0 w-full h-px transition-all duration-500 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-transparent via-blue-300/30 to-green-200/20'
              : 'bg-gradient-to-r from-transparent via-green-300/20 to-blue-800/20'
          }`}
        />
        <div className="relative px-2 sm:px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse">
            <ModelSelector currentModel={currentModel} onModelChange={onModelChange}  />
            <div className="ml-1 sm:ml-2 rtl:mr-1 sm:rtl:mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`h-10 w-10 transition-all duration-300 backdrop-blur-sm border rounded-full hover:shadow-xl hover:scale-105 group ${
                  theme === 'dark'
                    ? 'bg-gradient-to-tr from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30  hover:from-blue-300 hover:to-green-300 text-white  hover:border-emerald-200/20'
                    : 'bg-gradient-to-tr from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30  hover:from-green-300 hover:to-green-300 text-gray-100  hover:border-blue-300/20'
                }`}
                aria-label="تغيير المظهر"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500 text-green-400" />
                ) : (
                  <Moon className="h-4 w-4 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </Button>
            </div>
            <ProfileDropdown
            
              
              
            
            />
          </div>
        </div>
      </div>
    </header>
  );
}