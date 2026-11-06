/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { EventsView } from './components/EventsView';
import { ProfileView } from './components/ProfileView';
import { CertificatesView } from './components/CertificatesView';
import { MyRegistrationsView } from './components/MyRegistrationsView';
import { CreateEventModal } from './components/CreateEventModal';
import { RegisterView } from './components/RegisterView';
import {
  VolunteerProfile,
  VolunteerEvent,
  EventNotification,
  VolunteerCertificate,
  EventRegistration,
} from './types/volunteer';
import {
  loadProfile,
  saveProfile,
  loadEvents,
  saveEvents,
  loadNotifications,
  saveNotifications,
  loadCertificates,
  saveCertificates,
  loadRegistrations,
  saveRegistrations,
} from './services/storage';
import { Heart, Sparkles, Award, Calendar, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('events');
  const [profile, setProfile] = useState<VolunteerProfile>(loadProfile);
  const [events, setEvents] = useState<VolunteerEvent[]>(loadEvents);
  const [notifications, setNotifications] = useState<EventNotification[]>(loadNotifications);
  const [certificates, setCertificates] = useState<VolunteerCertificate[]>(loadCertificates);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(loadRegistrations);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [recentNotificationToast, setRecentNotificationToast] = useState<string | null>(null);

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveCertificates(certificates);
  }, [certificates]);

  useEffect(() => {
    saveRegistrations(registrations);
  }, [registrations]);

  // Derived registered event IDs
  const registeredEventIds = new Set(
    registrations.filter((r) => r.status !== 'cancelled').map((r) => r.eventId)
  );

  const registeredEventsList = events.filter((ev) => registeredEventIds.has(ev.id));

  // Handle Event Registration
  const handleRegister = (eventId: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    // Check if already registered
    if (registeredEventIds.has(eventId)) return;

    // Create registration
    const newReg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      volunteerId: profile.id,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
    };

    setRegistrations((prev) => [newReg, ...prev]);

    // Increment event participant count
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredVolunteersCount: e.registeredVolunteersCount + 1 }
          : e
      )
    );

    // Create notification
    const regNotification: EventNotification = {
      id: `notif-${Date.now()}`,
      eventId,
      title: 'Участие подтверждено! 🎉',
      message: `Вы успешно записаны на «${targetEvent.title}». Координатор свяжется с вами за день до начала.`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'registration_accepted',
    };

    setNotifications((prev) => [regNotification, ...prev]);
    showToast(`Вы успешно записались на «${targetEvent.title}»!`);
  };

  // Handle Cancel Registration
  const handleUnregister = (eventId: string) => {
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredVolunteersCount: Math.max(0, e.registeredVolunteersCount - 1) }
          : e
      )
    );
    showToast('Запись на мероприятие отменена.');
  };

  // Handle Publishing a New Event
  const handleCreateEvent = (newEvent: VolunteerEvent) => {
    setEvents((prev) => [newEvent, ...prev]);

    // Broadcast new event notification to volunteer!
    const newEventNotification: EventNotification = {
      id: `notif-${Date.now()}`,
      eventId: newEvent.id,
      title: `Новое мероприятие: ${newEvent.title}`,
      message: `Опубликовано новое волонтёрское событие в категории «${newEvent.category}» (${newEvent.location}). Открыт набор волонтёров!`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'new_event',
    };

    setNotifications((prev) => [newEventNotification, ...prev]);
    showToast(`Мероприятие «${newEvent.title}» опубликовано, волонтёры получили уведомление!`);
  };

  // Handle Certificate Addition
  const handleAddCertificate = (newCert: VolunteerCertificate) => {
    setCertificates((prev) => [newCert, ...prev]);

    // Trigger notification
    const certNotification: EventNotification = {
      id: `notif-${Date.now()}`,
      title: 'Сертификат добавлен в профиль! 📜',
      message: `Ваш сертификат «${newCert.title}» успешно сохранён. В вашу волонтёрскую книжку зачислено +${newCert.hoursCredited} часов!`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'certificate_awarded',
    };

    setNotifications((prev) => [certNotification, ...prev]);
    showToast(`Сертификат добавлен (+${newCert.hoursCredited} часов в книжку)!`);
  };

  const handleDeleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    showToast('Сертификат удален.');
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setRecentNotificationToast(msg);
    setTimeout(() => {
      setRecentNotificationToast(null);
    }, 4500);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRegisterSuccess = (newProfile: VolunteerProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);

    // Create a celebration welcome notification
    const welcomeNotif: EventNotification = {
      id: `notif-${Date.now()}`,
      title: 'Добро пожаловать в kadam.kg! 🎉',
      message: `Рады приветствовать вас, ${newProfile.fullName}! Ваша электронная волонтёрская книжка открыта. Выберите первое доброе дело в каталоге!`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'registration_accepted',
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);
    showToast(`Добро пожаловать, ${newProfile.fullName}! Регистрация завершена.`);
  };

  const totalHours = certificates.reduce((sum, c) => sum + (c.hoursCredited || 0), 0);

  // Standalone Registration & Auth Page (Like Instagram)
  if (activeTab === 'register') {
    return (
      <RegisterView
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToEvents={() => setActiveTab('events')}
        currentProfile={profile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsRead}
        onOpenCreateEvent={() => setIsCreateModalOpen(true)}
        onSelectEventFromNotification={(eventId) => {
          setActiveTab('events');
        }}
        totalVolunteerHours={totalHours}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'events' && (
          <EventsView
            events={events}
            registeredEventIds={registeredEventIds}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
            onOpenCreateEvent={() => setIsCreateModalOpen(true)}
            onNavigateToRegister={() => setActiveTab('register')}
            latestNotificationMessage={recentNotificationToast}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            certificates={certificates}
            attendedEventsCount={registeredEventsList.length}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              showToast('Профиль и фото успешно обновлены!');
            }}
            onNavigateToCertificates={() => setActiveTab('certificates')}
          />
        )}

        {activeTab === 'certificates' && (
          <CertificatesView
            certificates={certificates}
            onAddCertificate={handleAddCertificate}
            onDeleteCertificate={handleDeleteCertificate}
          />
        )}

        {activeTab === 'registrations' && (
          <MyRegistrationsView
            registeredEvents={registeredEventsList}
            onUnregister={handleUnregister}
            onExploreEvents={() => setActiveTab('events')}
          />
        )}
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      {/* Floating Toast Notification */}
      {recentNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{recentNotificationToast}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-sm">
              kadam<span className="text-emerald-600">.kg</span>
            </span>
            <span className="text-slate-400">|</span>
            <span>Волонтёрская платформа Кыргызстана • Шаг к добрым делам</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Электронная волонтёрская книжка</span>
            <span>•</span>
            <span>Верифицированные сертификаты</span>
            <span>•</span>
            <span>Уведомления о событиях</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
