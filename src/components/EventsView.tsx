import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Sparkles,
  TreePine,
  Heart,
  Dog,
  Trophy,
  Palette,
  AlertOctagon,
  ShieldAlert,
  ChevronRight,
  Info,
  Gift,
} from 'lucide-react';
import { VolunteerEvent, EventCategory } from '../types/volunteer';
import { filterEvents, formatRussianDate } from '../utils/volunteer-logic';

interface EventsViewProps {
  events: VolunteerEvent[];
  registeredEventIds: Set<string>;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  onOpenCreateEvent: () => void;
  onNavigateToRegister?: () => void;
  latestNotificationMessage?: string | null;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  registeredEventIds,
  onRegister,
  onUnregister,
  onOpenCreateEvent,
  onNavigateToRegister,
  latestNotificationMessage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOnlineOnly, setIsOnlineOnly] = useState<boolean>(false);
  const [selectedEventModal, setSelectedEventModal] = useState<VolunteerEvent | null>(null);

  const categories: Array<{ id: EventCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: 'Все направления', icon: Sparkles },
    { id: 'ecology', label: 'Экология', icon: TreePine },
    { id: 'animals', label: 'Забота о животных', icon: Dog },
    { id: 'social', label: 'Социальная помощь', icon: Heart },
    { id: 'sport', label: 'Спорт', icon: Trophy },
    { id: 'culture', label: 'Культура', icon: Palette },
    { id: 'emergency', label: 'ЧС и сбор помощи', icon: ShieldAlert },
  ];

  const filtered = filterEvents(events, {
    category: selectedCategory,
    searchQuery,
    isOnlineOnly,
  });

  return (
    <div className="space-y-6">
      {/* Real-time Notification Banner if an event was recently published */}
      {latestNotificationMessage && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded text-white">
                Новое событие
              </span>
              <p className="text-xs sm:text-sm font-semibold mt-0.5 text-white">
                {latestNotificationMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Календарь добрых дел 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Найди своё мероприятие и начни помогать уже сегодня
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Присоединяйся к тысячам волонтёров: убирай природу, поддерживай приюты для животных,
            помогай пожилым людям и получай официальные верифицированные сертификаты и часы в волонтёрскую книжку!
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Смотреть все события ({events.length})
            </button>
            <button
              onClick={onOpenCreateEvent}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              Опубликовать своё мероприятие
            </button>
            {onNavigateToRegister && (
              <button
                onClick={onNavigateToRegister}
                className="bg-white hover:bg-emerald-50 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Регистрация в kadam ID</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Online Toggle */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию, городу или организатору..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOnlineOnly}
                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span>Только онлайн-формат</span>
            </label>

            <span className="text-xs font-medium text-slate-400">
              Найдено: <strong className="text-slate-800">{filtered.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((event) => {
          const isRegistered = registeredEventIds.has(event.id);
          const percentFilled = Math.min(
            100,
            Math.round((event.registeredVolunteersCount / event.requiredVolunteers) * 100)
          );

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Event Image */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {event.category === 'ecology' && '🌿 Экология'}
                      {event.category === 'animals' && '🐕 Животные'}
                      {event.category === 'social' && '🤝 Социальная помощь'}
                      {event.category === 'sport' && '🏃 Спорт'}
                      {event.category === 'culture' && '🎭 Культура'}
                      {event.category === 'emergency' && '🚨 Сбор помощи'}
                    </span>
                    {event.isOnline && (
                      <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Онлайн
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      +{event.hoursGranted} ч. в книжку
                    </span>
                  </div>

                  {/* Location overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1 truncate font-medium drop-shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium drop-shadow-sm shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{formatRussianDate(event.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3
                    onClick={() => setSelectedEventModal(event)}
                    className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Organizer info */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                    {event.organizerAvatar ? (
                      <img
                        src={event.organizerAvatar}
                        alt={event.organizerName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                        О
                      </div>
                    )}
                    <span className="truncate font-medium">{event.organizerName}</span>
                  </div>

                  {/* Volunteer Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>Набрано волонтёров:</span>
                      <span className="font-bold text-slate-900">
                        {event.registeredVolunteersCount} из {event.requiredVolunteers}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentFilled >= 100 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Perks Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {event.perks.slice(0, 2).map((perk) => (
                      <span
                        key={perk}
                        className="bg-emerald-50 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-md"
                      >
                        ✓ {perk}
                      </span>
                    ))}
                    {event.perks.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium self-center">
                        +{event.perks.length - 2} бонуса
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedEventModal(event)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                >
                  Подробнее
                </button>

                {isRegistered ? (
                  <button
                    onClick={() => onUnregister(event.id)}
                    className="flex-1 bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group/btn"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:hidden" />
                    <span className="group-hover/btn:hidden">Вы записаны</span>
                    <span className="hidden group-hover/btn:inline">Отменить запись</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onRegister(event.id)}
                    disabled={event.registeredVolunteersCount >= event.requiredVolunteers}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    {event.registeredVolunteersCount >= event.requiredVolunteers
                      ? 'Мест нет'
                      : 'Записаться'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">По вашему запросу событий не найдено</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Попробуйте изменить категорию или сбросить поисковый запрос, чтобы увидеть больше мероприятий.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setIsOnlineOnly(false);
            }}
            className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Detailed Event Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Image Header */}
            <div className="relative h-56 w-full bg-slate-900 shrink-0">
              <img
                src={selectedEventModal.imageUrl}
                alt={selectedEventModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedEventModal(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                aria-label="Закрыть окно"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  +{selectedEventModal.hoursGranted} часов в волонтёрскую книжку
                </span>
                <h3 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-sm">
                  {selectedEventModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-slate-700 text-xs">
              {/* Key metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Дата</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {formatRussianDate(selectedEventModal.date)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Время</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {selectedEventModal.time}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Формат</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {selectedEventModal.isOnline ? '🌐 Онлайн' : '📍 Оффлайн'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Места</span>
                  <span className="font-bold text-emerald-700 text-xs mt-0.5 block">
                    {selectedEventModal.registeredVolunteersCount} / {selectedEventModal.requiredVolunteers}
                  </span>
                </div>
              </div>

              {/* Location details */}
              <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{selectedEventModal.location}</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">{selectedEventModal.address}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">О мероприятии и задачи волонтёров</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {selectedEventModal.description}
                </p>
              </div>

              {/* Organizer details */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Организатор</h4>
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedEventModal.organizerAvatar || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=120&q=80'}
                    alt={selectedEventModal.organizerName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      {selectedEventModal.organizerName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Верифицированная благотворительная организация
                    </span>
                  </div>
                </div>
              </div>

              {/* Perks */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Что получают волонтёры:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedEventModal.perks.map((p) => (
                    <div
                      key={p}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-2 rounded-xl text-slate-700 text-xs"
                    >
                      <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Закрыть
              </button>

              {registeredEventIds.has(selectedEventModal.id) ? (
                <button
                  onClick={() => {
                    onUnregister(selectedEventModal.id);
                    setSelectedEventModal(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Отменить участие
                </button>
              ) : (
                <button
                  onClick={() => {
                    onRegister(selectedEventModal.id);
                    setSelectedEventModal(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Записаться волонтёром
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
