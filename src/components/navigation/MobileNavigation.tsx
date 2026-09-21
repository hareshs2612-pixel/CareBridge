import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, Calendar, Video, FileText } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/teleconsult', label: 'Teleconsult', icon: Video },
    { to: '/patient/records', label: 'Records', icon: FileText }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium transition ${
                  isActive
                    ? 'text-cb-blue font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
