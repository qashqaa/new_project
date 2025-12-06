import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/orders',
      name: '📦 Заказы',
    },
    {
      path: '/products',
      name: '🛍️ Продукты',
    },
    {
      path: '/materials',
      name: '📋 Материалы',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sticky top-0 h-screen overflow-y-auto">
      {/* Заголовок */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Panda Print</h1>
      </div>

      {/* Меню */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
