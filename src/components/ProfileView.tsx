import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  Sparkles,
  Save,
  Check,
  Plus,
  X,
  Bell,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { VolunteerProfile, VolunteerCertificate } from '../types/volunteer';
import { fileToBase64 } from '../services/storage';
import { calculateVolunteerStats } from '../utils/volunteer-logic';

interface ProfileViewProps {
  profile: VolunteerProfile;
  certificates: VolunteerCertificate[];
  attendedEventsCount: number;
  onUpdateProfile: (updated: VolunteerProfile) => void;
  onNavigateToCertificates: () => void;
}

const PRESET_SKILLS = [
  'Экологические субботники',
  'Первая медицинская помощь',
  'Забота о животных',
  'Помощь пожилым людям',
  'Работа с детьми',
  'Организация и логистика',
  'Фото и видеосъёмка',
  'Английский язык',
  'IT и веб-разработка',
  'Авто-волонтёр (права кат. B)',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  certificates,
  attendedEventsCount,
  onUpdateProfile,
  onNavigateToCertificates,
}) => {
  const [fullName, setFullName] = useState<string>(profile.fullName);
  const [city, setCity] = useState<string>(profile.city);
  const [phone, setPhone] = useState<string>(profile.phone);
  const [email, setEmail] = useState<string>(profile.email);
  const [bio, setBio] = useState<string>(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkillText, setNewSkillText] = useState<string>('');

  const [notificationSettings, setNotificationSettings] = useState(profile.notificationSettings);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(profile.fullName);
    setCity(profile.city);
    setPhone(profile.phone);
    setEmail(profile.email);
    setBio(profile.bio);
    setAvatarUrl(profile.avatarUrl);
    setSkills(profile.skills);
    setNotificationSettings(profile.notificationSettings);
  }, [profile]);

  const stats = calculateVolunteerStats(certificates, attendedEventsCount);

  const [isFullscreenPhotoOpen, setIsFullscreenPhotoOpen] = useState<boolean>(false);

  // Handle local image file upload (avatar)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Размер фото не должен превышать 8 МБ');
      return;
    }

    try {
      setUploadError(null);
      const base64 = await fileToBase64(file);
      setAvatarUrl(base64);

      // Auto update profile avatar immediately
      const updated = {
        ...profile,
        avatarUrl: base64,
      };
      onUpdateProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error reading image file:', err);
      setUploadError('Не удалось загрузить изображение. Попробуйте другой файл.');
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkillText.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillText('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleTogglePresetSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VolunteerProfile = {
      ...profile,
      fullName: (fullName.trim() || profile.fullName).replace(/[ьЬ]/g, ''),
      city: (city.trim() || profile.city).replace(/[ьЬ]/g, ''),
      phone: phone.trim() || profile.phone,
      email: email.trim() || profile.email,
      bio: bio.trim(),
      avatarUrl,
      skills,
      notificationSettings,
    };

    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Camera upload button and Fullscreen preview */}
          <div className="relative group shrink-0">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-emerald-500/20 shadow-md bg-slate-950 flex items-center justify-center cursor-pointer relative"
              onClick={() => setIsFullscreenPhotoOpen(true)}
              title="Нажмите для просмотра в полный размер"
            >
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback in case of image load failure
                  (e.target as HTMLImageElement).src = '/assets/aistudio/avatar_gojo.jpg';
                }}
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1.5 p-2 backdrop-blur-[2px]">
                <span className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full text-[11px] transition-colors">
                  Открыть фото
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-2xl shadow-lg ring-4 ring-white transition-all transform hover:scale-110 cursor-pointer"
              title="Загрузить новое фото"
              type="button"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Basic Info & Volunteer Badge */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {fullName.replace(/[ьЬ]/g, '')}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{city.replace(/[ьЬ]/g, '')}</span>
                  <span className="text-slate-300">/</span>
                  <span>На платформе с 2024 г.</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs self-center sm:self-start" style={{ backgroundColor: stats.badgeColor }}>
                <ShieldCheck className="w-4 h-4" />
                <span>{stats.badgeLevel.replace(/[ьЬ]/g, '')}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl pt-1">
              {bio || 'Расскажите немного о себе и вашем волонтёрском опыте.'}
            </p>

            {uploadError && (
              <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
            )}

            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setIsFullscreenPhotoOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Посмотреть фото</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Изменить фото профиля</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToCertificates}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Мои сертификаты ({certificates.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Passport Metrics Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Часы добрых дел</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalHours}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">В электронной книжке</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Сертификаты</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.certificateCount}</div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Верифицированы</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Мероприятия</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{attendedEventsCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Посещено событий</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ранг волонтёра</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate">{stats.badgeLevel}</div>
          <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Надежный волонтёр</p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSaveAll} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Редактирование профиля волонтёра</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Укажите информацию о себе, навыки и контактные данные для организаторов
            </p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200 animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5" />
              <span>Сохранено!</span>
            </div>
          )}
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Имя и Фамилия
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.replace(/[ьЬ]/g, ''))}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Город проживания
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Электронная почта
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Номер телефона (WhatsApp)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Bio / About Me */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              О себе (волонтёрский опыт, цели и мотивация)
            </label>
            <span className="text-[11px] text-slate-400">{bio.length} / 500 симв.</span>
          </div>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            placeholder="Напишите, почему вы решили стать волонтёром, в каких сферах любите помогать..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Skills & Interests */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Навыки и направления помощи</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Выберите подходящие теги или добавьте свои уникальные навыки
            </p>
          </div>

          {/* Current selected skills */}
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 transition-colors"
                  aria-label={`Удалить ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Добавить свой навык (например, переводчик)..."
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
            >
              Добавить
            </button>
          </div>

          {/* Popular presets */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-1.5">Быстрый выбор из популярного:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SKILLS.filter((s) => !skills.includes(s)).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleTogglePresetSkill(preset)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>{preset}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800">Настройки уведомлений</h4>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.newEventsAlert}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, newEventsAlert: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Мгновенные уведомления о новых мероприятиях в моём городе</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.reminders}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, reminders: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Напоминания за 24 часа до начала событий, на которые я записан</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailAlerts}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, emailAlerts: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Дайджест добрых дел на электронную почту</span>
            </label>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить изменения</span>
          </button>
        </div>
      </form>

      {/* Full-resolution Photo Modal */}
      {isFullscreenPhotoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsFullscreenPhotoOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-white font-bold text-sm tracking-tight">
                  Фото профиля • {fullName.replace(/[ьЬ]/g, '')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenPhotoOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-3 bg-black/50 flex items-center justify-center min-h-[320px] max-h-[70vh] overflow-hidden">
              <img
                src={avatarUrl}
                alt={fullName}
                className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 truncate">
                {fullName.replace(/[ьЬ]/g, '')} • kadam.kg
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Сменить фото</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPhotoOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

