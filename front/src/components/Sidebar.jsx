import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

const Sidebar = () => {
  const location = useLocation();
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  const mainMenuItems = [
    {
      path: '/orders',
      name: 'Заказы',
      icon: '📦',
    },
    {
      path: '/products',
      name: 'Продукты',
      icon: '🛍️',
    },
    {
      path: '/materials',
      name: 'Материалы',
      icon: '📋',
    },
    {
      path: '/expenses',
      name: 'Расходы',
      icon: '💸',
    },
  ];

  const statisticsSubItems = [
    {
      path: '/statistics/byday',
      name: 'По дням',
      icon: '💰',
    },
    {
      path: '/statistics/graph',
      name: 'За год',
      icon: '📈',
    },
  ];

  const isActive = (path) => {
    if (path === '/statistics') {
      return statisticsSubItems.some((item) =>
        location.pathname.startsWith(item.path)
      );
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const isSubItemActive = (path) => {
    return location.pathname === path;
  };

  // Автоматически открываем подменю, если находимся в разделе статистики
  useEffect(() => {
    if (location.pathname.startsWith('/statistics/')) {
      setStatisticsOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="sticky top-0 h-screen overflow-y-auto bg-gradient-to-b from-gray-50 to-white border-r border-gray-200">
      {/* Заголовок */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">🐼</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Panda Print</h1>
            <p className="text-sm text-gray-500">CRM</p>
          </div>
        </div>
      </div>

      {/* Меню */}
      <nav className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Основное
        </p>

        <ul className="space-y-1">
          {mainMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Раздел статистики с подменю */}
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Аналитика
          </p>

          <div className="mb-1">
            {/* Главный пункт статистики */}
            <button
              onClick={() => setStatisticsOpen(!statisticsOpen)}
              className={`flex items-center justify-between w-full gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive('/statistics')
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <span className="font-medium">Статистика</span>
              </div>
              {statisticsOpen ? (
                <DownOutlined
                  style={{
                    fontSize: '14px',
                    color: isActive('/statistics') ? 'white' : '#6b7280',
                  }}
                />
              ) : (
                <RightOutlined
                  style={{
                    fontSize: '14px',
                    color: isActive('/statistics') ? 'white' : '#6b7280',
                  }}
                />
              )}
            </button>

            {/* Подменю статистики */}
            {statisticsOpen && (
              <div className="ml-8 mt-1 space-y-1 pl-2 border-l-2 border-gray-200">
                {statisticsSubItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isSubItemActive(item.path)
                        ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                    {isSubItemActive(item.path) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </nav>
    </div>
  );
};

export default Sidebar;
