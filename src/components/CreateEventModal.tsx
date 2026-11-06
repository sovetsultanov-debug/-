import React, { useState, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Upload,
  Sparkles,
  AlertCircle,
  Gift,
  TreePine,
  Dog,
  Heart,
  Trophy,
  Palette,
  ShieldAlert,
} from 'lucide-react';
import { VolunteerEvent, EventCategory } from '../types/volunteer';
import { fileToBase64 } from '../services/storage';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: VolunteerEvent) => void;
}

const PRESET_EVENT_IMAGES: Record<EventCategory, string> = {
  ecology: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  animals: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
  social: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
  sport: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
  culture: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  emergency: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<EventCategory>('ecology');
  const [date, setDate] = useState<string>(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('10:00 - 14:00');
  const [location, setLocation] = useState<string>('Бишкек');
  const [address, setAddress] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [requiredVolunteers, setRequiredVolunteers] = useState<number>(20);
  const [hoursGranted, setHoursGranted] = useState<number>(4);
  const [organizerName, setOrganizerName] = useState<string>('Волонтёрская команда «Kadam Bishkek»');
  const [imageUrl, setImageUrl] = useState<string>(PRESET_EVENT_IMAGES.ecology);
  const [perksText, setPerksText] = useState<string>('Часы в книжку, Горячий чай и питание, Благодарность');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (newCat: EventCategory) => {
    setCategory(newCat);
    // If user hasn't uploaded custom photo, switch to corresponding preset
    if (!imageUrl.startsWith('data:')) {
      setImageUrl(PRESET_EVENT_IMAGES[newCat]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер обложки превышает 5 МБ');
      return;
    }

    try {
      setError(null);
      const base64 = await fileToBase64(file);
      setImageUrl(base64);
    } catch {
      setError('Не удалось загрузить фото. Попробуйте другой файл.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Пожалуйста, заполните название и описание мероприятия.');
      return;
    }

    const newEvent: VolunteerEvent = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      time,
      location: location.trim(),
      address: address.trim() || (isOnline ? 'Ссылка в Zoom' : location.trim()),
      isOnline,
      requiredVolunteers: Math.max(1, Number(requiredVolunteers)),
      registeredVolunteersCount: 0,
      organizerName: organizerName.trim() || 'Организатор волонтёров',
      organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      imageUrl,
      perks: perksText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      status: 'active',
      hoursGranted: Math.max(1, Number(hoursGranted)),
    };

    onCreateEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Создать новое мероприятие</h3>
              <p className="text-[11px] text-slate-500">
                После публикации все волонтёры получат мгновенное уведомление
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold leading-none"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Название мероприятия *
            </label>
            <input
              type="text"
              placeholder="Например: Посадка 1000 саженцев яблонь в предгорьях"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Направление (Категория)
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
              >
                <option value="ecology">🌿 Экология и субботники</option>
                <option value="animals">🐕 Забота о животных</option>
                <option value="social">🤝 Социальная помощь</option>
                <option value="sport">🏃 Спортивные мероприятия</option>
                <option value="culture">🎭 Культура и фестивали</option>
                <option value="emergency">🚨 ЧС и срочная помощь</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Формат участия
              </label>
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="format"
                    checked={!isOnline}
                    onChange={() => setIsOnline(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>📍 Оффлайн (на месте)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="format"
                    checked={isOnline}
                    onChange={() => setIsOnline(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌐 Онлайн</span>
                </label>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Дата проведения
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Время проведения
              </label>
              <input
                type="text"
                placeholder="10:00 - 14:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Location & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Город / Регион
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Точный адрес или ссылка
              </label>
              <input
                type="text"
                placeholder={isOnline ? 'Ссылка на Zoom / Teams' : 'Улица, парк или ориентир'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Volunteer Count & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Требуется волонтёров (мест)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={requiredVolunteers}
                onChange={(e) => setRequiredVolunteers(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Часов в волонтёрскую книжку
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={hoursGranted}
                onChange={(e) => setHoursGranted(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Описание задач и требования к волонтёрам *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Расскажите, что предстоит делать, какую одежду взять, условия и контакты координатора..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Perks */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Бонусы волонтёрам (через запятую)
            </label>
            <input
              type="text"
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              placeholder="Питание, Мерч, Сертификат, Трансфер"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Обложка мероприятия (фотография)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt="Обложка"
                className="w-20 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Загрузить своё изображение</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Опубликовать и оповестить волонтёров
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
