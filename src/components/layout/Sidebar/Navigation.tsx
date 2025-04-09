
import React from 'react';
import { Home, Package, Bell, Settings, BarChart2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavItem from './NavItem';

interface NavigationProps {
  currentPath: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Package, label: "Inventory", to: "/inventory" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: BarChart2, label: "Analytics", to: "/analytics" },
  ];

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <NavItem
          key={item.to}
          icon={item.icon}
          label={item.label}
          to={item.to}
          active={currentPath === item.to}
        />
      ))}
      
      {/* Recently Deleted Items */}
      <Link to="/deleted-items">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 mb-1 mt-3"
        >
          <Trash2 size={18} />
          <span>Recently Deleted</span>
        </Button>
      </Link>
    </nav>
  );
};

export default Navigation;
