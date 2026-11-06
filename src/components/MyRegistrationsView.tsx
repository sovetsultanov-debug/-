import React from 'react';
import {
  ClipboardList,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { VolunteerEvent } from '../types/volunteer';
import { formatRussianDate } from '../utils/volunteer-logic';

interface MyRegistrationsViewProps {
  registeredEvents: VolunteerEvent[];
  onUnregister: (eventId: string) => void;
  onExploreEvents: () => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  registeredEvents,
  onUnregister,
  onExploreEvents,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Мой план добрых дел</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            События, в которых вы участвуете
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Здесь собраны все запланированные мероприятия, ваш статус участия и контакты координаторов.
          </p>
        </div>

        <button
          onClick={onExploreEvents}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Найти ещё события</span>
        </button>
      </div>

      {/* Registrations List */}
      {registeredEvents.length > 0 ? (
        <div className="space-y-4">
          {registeredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-1 ring-slate-100"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Подтверждено
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      +{event.hoursGranted} ч. в книжку
                    </span>
                    {event.isOnline && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Онлайн
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    {event.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formatRussianDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Организатор: <strong className="text-slate-700">{event.organizerName}</strong> • {event.address}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <button
                  onClick={() => onUnregister(event.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-rose-200 transition-colors"
                >
                  Отменить участие
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <ClipboardList className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Вы пока не записались на мероприятия</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Выберите интересное мероприятие в каталоге, запишитесь и получите уведомление о деталях участия.
          </p>
          <button
            onClick={onExploreEvents}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
          >
            Перейти к каталогу событий
          </button>
        </div>
      )}
    </div>
  );
};
