
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active }) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 mb-1",
          active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
        )}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

export default NavItem;
