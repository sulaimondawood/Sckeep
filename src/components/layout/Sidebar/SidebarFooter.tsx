
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SidebarFooter: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
      <Button variant="ghost" className="w-full justify-start gap-2 text-gray-500 dark:text-gray-400">
        <LogOut size={18} />
        <span>Logout</span>
      </Button>
    </div>
  );
};

export default SidebarFooter;
