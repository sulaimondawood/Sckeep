
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
  onClick?: () => void;
  isLogout?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon: Icon, 
  label, 
  to, 
  active, 
  onClick,
  isLogout = false 
}) => {
  const { logout } = useAuth();
  
  const handleClick = async (e: React.MouseEvent) => {
    if (isLogout) {
      e.preventDefault();
      await logout();
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <Link to={to} onClick={handleClick}>
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
