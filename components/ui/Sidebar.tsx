import React from 'react';

interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  active?: string;
  onItemClick?: (id: string) => void;
  collapsed?: boolean;
}

export function Sidebar({ items, active, onItemClick, collapsed = false }: SidebarProps) {
  return (
    <div className={`bg-gray-900 text-white h-full ${collapsed ? 'w-16' : 'w-64'} transition-all`}>
      <div className="p-4">
        <h2 className={`text-xl font-bold ${collapsed ? 'hidden' : 'block'}`}>Menu</h2>
      </div>
      <nav className="mt-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
              active === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
            }`}
          >
            {item.icon && <span className="mr-3">{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
