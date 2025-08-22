// components/sidebar/SidebarToggleButton.tsx
'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

interface SidebarToggleButtonProps {
  toggleSidebar: () => void;
}

export function SidebarToggleButton({ toggleSidebar }: SidebarToggleButtonProps) {
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [isRotated, setIsRotated] = useState(false); // حالة جديدة لتتبع دوران الأيقونة

  useEffect(() => {
    setCurrentTheme(theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  const handleClick = () => {
    toggleSidebar();
    setIsRotated(!isRotated); // تبديل حالة الدوران عند الضغط
  };

  const classes =
    currentTheme === 'dark'
      ? 'h-6 w-12 rounded-full  bg-gradient-to-tr from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30  hover:bg-blue-100 dark:hover:bg-blue-900/3 transition-colors duration-200 shadow-sm'
      : 'h-6 w-12 rounded-full  bg-gradient-to-tr from-violet-700 via-blue-900/90  to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30  hover:bg-blue-100 dark:hover:bg-blue-900/3 transition-colors duration-200 shadow-sm';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick} // استخدام handleClick بدلاً من toggleSidebar مباشرة
      className={`h-6 w-12  backdrop-blur-sm z-50 border rounded-full shadow-lg hover:shadow-xl hover:scale-105 ${classes}`}
      aria-label="تبديل الشريط الجانبي"
    >
      <ChevronLeft 
        className={`h-5 w-5 text-green-200 transition-transform duration-400 z-50 ${
          isRotated ? 'rotate-180' : ''
        }`} // إزالة hover:rotate-180 وإضافة شرط للدوران
      />
    </Button>
  );
}