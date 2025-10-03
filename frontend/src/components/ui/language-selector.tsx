"use client";

import { useTranslation } from '@/hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '@/@types/i18n.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { changeLanguage, currentLanguageInfo } = useTranslation();

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-gray-400 hover:text-white">
          <span className="text-lg">{currentLanguageInfo.flag}</span>
          <span className="hidden sm:inline text-sm">{currentLanguageInfo.code.toUpperCase()}</span>
          <i className="fas fa-chevron-down text-xs"></i>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              currentLanguageInfo.code === language.code
                ? 'bg-primary/10 text-primary'
                : ''
            }`}
          >
            <span className="mr-2 text-lg">{language.flag}</span>
            <span className="flex-1">{language.nativeName}</span>
            {currentLanguageInfo.code === language.code && (
              <i className="fas fa-check ml-2 text-xs"></i>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

