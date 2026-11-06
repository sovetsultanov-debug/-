import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  User,
  Award,
  Bell,
  PlusCircle,
  ClipboardList,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { VolunteerProfile, EventNotification } from '../types/volunteer';

export type NavTab = 'events' | 'profile' | 'certificates' | 'registrations' | 'register';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  profile: VolunteerProfile;
  notifications: EventNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenCreateEvent: () => void;
  onSelectEventFromNotification?: (eventId: string) => void;
  totalVolunteerHours: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  profile,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenCreateEvent,
  onSelectEventFromNotification,
  totalVolunteerHours,
}) => {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            onClick={() => onTabChange('events')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  kadam<span className="text-emerald-600">.kg</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  KG
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Волонтёрская платформа Кыргызстана
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => onTabChange('events')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'events'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Мероприятия</span>
            </button>

            <button
              onClick={() => onTabChange('registrations')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'registrations'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Мои записи</span>
            </button>

            <button
              onClick={() => onTabChange('certificates')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'certificates'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Сертификаты</span>
            </button>

            <button
              onClick={() => onTabChange('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Мой профиль</span>
            </button>

            <button
              onClick={() => onTabChange('register')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Регистрация</span>
            </button>
          </nav>

          {/* Right Action Icons: Add Event, Notifications, Profile Chip */}
          <div className="flex items-center gap-2.5">
            {/* Create Event Button */}
            <button
              onClick={onOpenCreateEvent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              aria-label="Создать мероприятие"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Создать мероприятие</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl border transition-colors ${
                  showNotifications
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                aria-label={`Уведомления ${unreadCount > 0 ? `(${unreadCount} новых)` : ''}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-0 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Уведомления о событиях</span>
                      {unreadCount > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} новых
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsAsRead}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
                      >
                        Прочитать все
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Нет новых уведомлений
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationAsRead(notif.id);
                            if (notif.eventId && onSelectEventFromNotification) {
                              onSelectEventFromNotification(notif.eventId);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                            notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/60 hover:bg-emerald-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                              notif.type === 'new_event'
                                ? 'bg-emerald-100 text-emerald-700'
                                : notif.type === 'registration_accepted'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {notif.type === 'new_event' ? (
                              <Sparkles className="w-4 h-4" />
                            ) : notif.type === 'registration_accepted' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Award className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4
                                className={`text-xs font-semibold truncate ${
                                  notif.read ? 'text-slate-800' : 'text-emerald-950'
                                }`}
                              >
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                              Недавно
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Quick Chip */}
            <div
              onClick={() => onTabChange('profile')}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Перейти в личный профиль"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-900 block truncate max-w-[110px]">
                  {profile.fullName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  {totalVolunteerHours} ч. в книжке
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onTabChange('events')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'events' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">События</span>
          </button>

          <button
            onClick={() => onTabChange('registrations')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'registrations' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="text-[10px]">Записи</span>
          </button>

          <button
            onClick={() => onTabChange('certificates')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'certificates' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[10px]">Сертификаты</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Профиль</span>
          </button>

          <button
            onClick={() => onTabChange('register')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'register' ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px]">Вход/Рег</span>
          </button>
        </div>
      </div>
    </header>
  );
};
