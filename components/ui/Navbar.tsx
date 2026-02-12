import React from 'react';

interface NavbarItem {
  id: string;
  label: string;
}

interface NavbarProps {
  logo?: string;
  items?: NavbarItem[];
  actions?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export function Navbar({ logo, items = [], actions, variant = 'light' }: NavbarProps) {
  const bgClass = variant === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border-b border-gray-200';
  const hoverClass = variant === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  
  return (
    <nav className={`${bgClass} px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {logo && <div className="text-xl font-bold">{logo}</div>}
          <div className="flex space-x-4">
            {items.map((item) => (
              <button
                key={item.id}
                className={`px-3 py-2 rounded-lg ${hoverClass} transition-colors`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {actions && <div className="flex items-center space-x-4">{actions}</div>}
      </div>
    </nav>
  );
}
