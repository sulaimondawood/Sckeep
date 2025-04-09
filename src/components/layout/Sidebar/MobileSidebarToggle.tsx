
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileSidebarToggleProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const MobileSidebarToggle: React.FC<MobileSidebarToggleProps> = ({
  sidebarOpen,
  toggleSidebar
}) => {
  return (
    <div className="lg:hidden fixed z-20 top-4 left-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleSidebar} 
        className="rounded-full bg-white dark:bg-gray-800 shadow-md"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </Button>
    </div>
  );
};

export default MobileSidebarToggle;
