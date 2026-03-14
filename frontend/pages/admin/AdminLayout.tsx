import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ChefHat, Store, UserCircle, Armchair, Menu as MenuIcon, FileBarChart, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Should be handled by router protection, but safety check

  // 1. Define Navigation Items (Reordered per instruction)
  const mainNavItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['manager', 'admin'] },
    { to: '/admin/pos', icon: <Store size={20} />, label: 'POS', roles: ['manager', 'admin', 'cashier'] },
    { to: '/admin/kitchen', icon: <ChefHat size={20} />, label: 'Kitchen', roles: ['manager', 'admin', 'kitchen'] },
    { to: '/admin/tables', icon: <Armchair size={20} />, label: 'Tables', roles: ['manager', 'admin', 'cashier'] },
    { to: '/admin/menu-management', icon: <MenuIcon size={20} />, label: 'Menu Management', roles: ['manager', 'admin'] },
    { to: '/admin/reports', icon: <FileBarChart size={20} />, label: 'Reports', roles: ['manager', 'admin'] },
  ];

  // Settings is separated
  const settingsItem = { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings', roles: ['manager', 'admin'] };

  const allowedMainNav = mainNavItems.filter(item => item.roles.includes(user.role));
  const showSettings = settingsItem.roles.includes(user.role);

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans">
      {/* Sidebar with Collapsible Logic */}
      <aside
        className={`bg-forest text-beige flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wider whitespace-nowrap">Rustic Roots</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs opacity-60 uppercase tracking-widest">{user.role} Portal</p>
                <span className="bg-terracotta text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm animate-pulse shadow-sm">DEMO</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-stone-300 hover:text-white transition-colors focus:outline-none"
          >
            {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          {/* Main Items */}
          {allowedMainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 py-3 rounded-lg transition-all duration-200
                ${isCollapsed ? 'justify-center px-2' : 'px-4'}
                ${isActive
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}

          {/* Spacer to push Settings to bottom */}
          <div className="mt-auto"></div>

          {/* Settings Item (Separated) */}
          {showSettings && (
            <NavLink
              to={settingsItem.to}
              className={({ isActive }) => `
               flex items-center gap-3 py-3 rounded-lg transition-all duration-200 mb-2
               ${isCollapsed ? 'justify-center px-2' : 'px-4'}
               ${isActive
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'}
             `}
              title={isCollapsed ? settingsItem.label : ''}
            >
              <div className="shrink-0">{settingsItem.icon}</div>
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{settingsItem.label}</span>}
            </NavLink>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-2`}>

            {/* User Info */}
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="shrink-0">
                <UserCircle className="text-terracotta" size={24} />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold capitalize truncate">{user.username}</p>
                  <p className="text-xs opacity-50 capitalize truncate">{user.role}</p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            {!isCollapsed && (
              <button onClick={handleLogout} className="text-stone-400 hover:text-white transition-colors" title="Logout">
                <LogOut size={18} />
              </button>
            )}
          </div>
          {/* Collapsed Logout separate button for UX */}
          {isCollapsed && (
            <button onClick={handleLogout} className="w-full mt-4 text-stone-400 hover:text-white transition-colors flex justify-center" title="Logout">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between md:hidden shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-serif text-xl font-bold text-forest">Rustic Roots</h1>
              <span className="bg-terracotta text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">DEMO</span>
            </div>
            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded capitalize">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="text-stone-400 hover:text-terracotta">
            <LogOut size={20} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Nav */}
        <nav className="md:hidden bg-forest text-stone-300 flex justify-around p-4 overflow-x-auto">
          {allowedMainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : ''} shrink-0
              `}
            >
              {item.icon}
            </NavLink>
          ))}
          {showSettings && (
            <NavLink
              to={settingsItem.to}
              className={({ isActive }) => `
               p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : ''} shrink-0
             `}
            >
              {settingsItem.icon}
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;