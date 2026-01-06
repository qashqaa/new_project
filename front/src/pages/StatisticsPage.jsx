// pages/StatisticsPage.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function StatisticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Статистика</h1>

      {/* Навигация по подразделам статистики */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <NavLink
          to="bydays"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${isActive
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
            }`
          }
        >
          По дням
        </NavLink>
        <NavLink
          to="year"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg ${isActive
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
            }`
          }
        >
          За год
        </NavLink>
      </div>

      {/* Контейнер для вложенных маршрутов */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}

export default StatisticsPage;