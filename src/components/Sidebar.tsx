import React from 'react';
import { Home, PieChart, User, Users } from 'lucide-react';
import { Page } from '../types';
import { Blob1 } from './IllustrationElements';
const LOGO_URL = 'https://i.postimg.cc/bw1Ww0m0/Toi-Task-(1).png';
interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}
export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
  {
    id: 'home',
    label: 'Tasks',
    icon: Home
  },
  {
    id: 'overview',
    label: 'Overview',
    icon: PieChart
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User
  }] as
  const;
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[var(--cream)] border-r-4 border-[var(--black)] flex-col items-stretch py-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 text-[var(--mustard-light)] opacity-50 pointer-events-none">
          <Blob1 />
        </div>

        <div className="px-4 mb-12 relative z-10">
          <img
            src={LOGO_URL}
            alt="Toi-Task"
            className="w-40 h-auto object-contain" />

        </div>

        <nav className="flex-1 space-y-4 px-4 relative z-10">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center justify-start p-3 rounded-2xl transition-all duration-300
                  ${isActive ? 'bg-[var(--black)] text-[var(--mustard)] shadow-[4px_4px_0px_0px_var(--teal)] transform -translate-y-1' : 'hover:bg-[var(--cream-light)] text-[var(--black-soft)] hover:scale-105'}
                `}>

                <Icon
                  className={`w-6 h-6 ${isActive ? 'stroke-[3px]' : 'stroke-2'}`} />

                <span
                  className={`ml-3 font-bold ${isActive ? 'text-lg' : 'text-base'}`}>

                  {item.label}
                </span>
              </button>);

          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-[var(--black)] px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-xl min-w-[64px] transition-all
                  ${isActive ? 'bg-[var(--black)] text-[var(--mustard)] shadow-[3px_3px_0px_0px_var(--teal)]' : 'text-[var(--black-soft)] active:bg-gray-100'}
                `}>

                <Icon
                  className={`w-5 h-5 ${isActive ? 'stroke-[3px]' : 'stroke-2'}`} />

                <span
                  className={`text-[10px] mt-1 font-bold ${isActive ? '' : 'text-gray-500'}`}>

                  {item.label}
                </span>
              </button>);

          })}
        </div>
      </nav>
    </>);

}