
import React from 'react';
import { LogOut } from 'lucide-react';
import NavItem from './NavItem';

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

interface SidebarNavigationProps {
  navItems: NavItem[];
  isRouteActive: (path: string) => boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ navItems, isRouteActive }) => {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            active={isRouteActive(item.to)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <NavItem
          icon={LogOut}
          label="Logout"
          to="/logout"
          active={false}
          isLogout={true}
        />
      </div>
    </div>
  );
};

export default SidebarNavigation;
