
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  logoSrc: string;
  toggleSidebar: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ logoSrc, toggleSidebar }) => {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
      {/* Logo in the center of the sidebar header */}
      <div className="flex items-center justify-center w-full">
        <img 
          src={logoSrc} 
          alt="Sckeep Logo" 
          className="h-10 object-contain"
        />
      </div>
      {/* Close button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar} 
        className="absolute right-2"
      >
        <X size={18} />
      </Button>
    </div>
  );
};

export default SidebarHeader;
