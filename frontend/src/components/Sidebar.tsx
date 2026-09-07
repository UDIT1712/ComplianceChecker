import { NavLink } from 'react-router-dom';
import { Search, FileText, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar() {
  const navItems = [
    { to: '/', icon: Search, label: 'Workspace' },
    { to: '/documents', icon: FileText, label: 'Documents' },
  ];

  return (
    <div className="flex h-full w-[72px] flex-shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-light py-5 dark:border-slate-800 dark:bg-dark">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
        <Shield size={18} />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.label}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                )
              )
            }
          >
            <item.icon size={19} />
          </NavLink>
        ))}
      </nav>

      <ThemeToggle />
    </div>
  );
}
