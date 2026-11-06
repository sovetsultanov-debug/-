import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  Camera,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Check,
  AlertCircle,
  MessageCircle,
  Bookmark,
  Share2,
  Instagram,
  Download,
  Smartphone,
  Globe,
} from 'lucide-react';
import { VolunteerProfile } from '../types/volunteer';
import { fileToBase64 } from '../services/storage';
import { calculatePasswordStrength, validateRegistrationData } from '../utils/volunteer-logic';

interface RegisterViewProps {
  onRegisterSuccess: (profile: VolunteerProfile) => void;
  onNavigateToEvents: () => void;
  currentProfile: VolunteerProfile;
}

// Instagram mockup volunteer posts/stories
const INSTAGRAM_MOCKUP_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    title: 'Большой эко-десант в Ала-Арче',
    organizer: 'taza_muras.kg',
    likes: 1248,
    comments: 86,
    caption: 'Сегодня волонтёры собрали более 40 мешков пластика в ущелье Ала-Арча! Спасибо каждому за шаг к чистому Кыргызстану. 🌿🇰🇬 #kadamkg #tazamuras',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    title: 'День заботы в приюте «Добрые руки»',
    organizer: 'priyut_dobryeruki',
    likes: 2410,
    comments: 142,
    caption: 'Более 30 волонтёров выгуляли и покормили спасённых собак. Четвероногие друзья счастливы! 🐕❤️ #добрыедела #бишкек',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    title: 'Run the Silk Road на Иссык-Куле',
    organizer: 'run_silk_road_kg',
    likes: 3890,
    comments: 215,
    caption: 'Финиш международного марафона на берегу Иссык-Куля! Волонтёры kadam.kg встретили участников из 25 стран! 🏃‍♂️🏅 #issikkul',
  },
];

const KYRGYZ_CITIES = [
  'Бишкек',
  'Ош',
  'Чолпон-Ата (Иссык-Куль)',
  'Каракол',
  'Джалал-Абад',
  'Нарын',
  'Талас',
  'Баткен',
  'Токмок',
  'Кант',
];

const VOLUNTEER_DIRECTIONS = [
  { id: 'ecology', label: 'Экология и природа', icon: '🌿' },
  { id: 'animals', label: 'Забота о животных', icon: '🐕' },
  { id: 'social', label: 'Помощь детям и пожилым', icon: '🤝' },
  { id: 'sport', label: 'Спорт и марафоны', icon: '🏃' },
  { id: 'culture', label: 'Культура и ремёсла', icon: '🎭' },
  { id: 'emergency', label: 'ЧС и спасение', icon: '🚨' },
  { id: 'digital', label: 'IT, дизайн и медиа', icon: '💻' },
  { id: 'medical', label: 'Первая медпомощь', icon: '🩺' },
];

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateToEvents,
  currentProfile,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+996 ');
  const [city, setCity] = useState<string>('Бишкек');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    currentProfile.avatarUrl || '/assets/aistudio/WhatsApp_Image_2026-10-23_at_22.34.26_d4b42122.jpeg'
  );
  const [selectedDirections, setSelectedDirections] = useState<string[]>([
    'Экология и природа',
    'Забота о животных',
  ]);
  const [showExtraSettings, setShowExtraSettings] = useState<boolean>(false);

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [likedSlide, setLikedSlide] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto rotate Instagram phone mockup slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % INSTAGRAM_MOCKUP_SLIDES.length);
      setLikedSlide(false);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const passwordStrength = calculatePasswordStrength(password);
  const currentSlide = INSTAGRAM_MOCKUP_SLIDES[currentSlideIndex];

  const handleToggleDirection = (label: string) => {
    if (selectedDirections.includes(label)) {
      setSelectedDirections(selectedDirections.filter((d) => d !== label));
    } else {
      setSelectedDirections([...selectedDirections, label]);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Размер фото не должен превышать 8 МБ');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setAvatarUrl(base64);
    } catch {
      setErrorMessage('Не удалось загрузить изображение.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateRegistrationData({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      city,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Проверьте заполненные поля');
      return;
    }

    const newProfile: VolunteerProfile = {
      id: `vol-${Date.now()}`,
      fullName: fullName.trim() || 'Усон Советбекович',
      email: email.trim() || 'sovetsultanov@gmail.com',
      phone: phone.trim() || '+996 555 123 456',
      city,
      avatarUrl,
      bio: `Привет! Я активный волонтёр платформы kadam.kg. Участвую в добрых делах в городе ${city} и по всему Кыргызстану!`,
      birthDate: '2003-05-18',
      skills: selectedDirections.length > 0 ? selectedDirections : ['Экология и природа'],
      registeredDate: new Date().toISOString().split('T')[0],
      notificationSettings: {
        newEventsAlert: true,
        reminders: true,
        emailAlerts: true,
        pushAlerts: true,
      },
    };

    onRegisterSuccess(newProfile);
    setIsSuccess(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Введите корректный email для входа');
      return;
    }

    onRegisterSuccess({
      ...currentProfile,
      email: email.trim(),
    });
    setIsSuccess(true);
  };

  const handleQuickGoogleAuth = () => {
    onRegisterSuccess({
      ...currentProfile,
      fullName: currentProfile.fullName || 'Усон Советбекович',
      email: 'sovetsultanov@gmail.com',
    });
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Standalone Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateToEvents}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>На главную kadam.kg</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Платформа открыта для волонтёров Кыргызстана</span>
        </div>
      </header>

      {/* Main Content: Split Phone Mockup + Instagram Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="flex items-center justify-center gap-10 lg:gap-14 max-w-5xl w-full">
          {/* LEFT COLUMN: Instagram Phone Mockup with Volunteer Feed */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            {/* Phone Chassis */}
            <div className="w-[360px] h-[580px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/60 relative overflow-hidden flex flex-col select-none">
              {/* Dynamic Island / Speaker */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Internal Screen */}
              <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col text-slate-900 relative">
                {/* Instagram Header inside phone */}
                <div className="pt-7 px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-slate-900">
                      kadam<span className="text-emerald-600">.kg</span>
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      KG
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Heart className="w-4 h-4" />
                    <MessageCircle className="w-4 h-4" />
                  </div>
                </div>

                {/* Simulated Post Author */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src={currentSlide.image}
                          alt={currentSlide.organizer}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 leading-tight">
                        {currentSlide.organizer}
                      </div>
                      <div className="text-[9px] text-slate-400">Кыргызстан · Волонтёры</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest">•••</span>
                </div>

                {/* Post Main Image with slide fade */}
                <div
                  className="relative w-full h-[270px] bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => setLikedSlide(!likedSlide)}
                >
                  <img
                    key={currentSlide.id}
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {currentSlideIndex + 1}/{INSTAGRAM_MOCKUP_SLIDES.length}
                  </div>

                  {/* Double tap heart feedback */}
                  {likedSlide && (
                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50 duration-200 pointer-events-none">
                      <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Post Action Buttons */}
                <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLikedSlide(!likedSlide)}
                      className="cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          likedSlide ? 'text-rose-500 fill-rose-500' : 'text-slate-800'
                        }`}
                      />
                    </button>
                    <MessageCircle className="w-4 h-4 text-slate-800" />
                    <Share2 className="w-4 h-4 text-slate-800" />
                  </div>
                  <Bookmark className="w-4 h-4 text-slate-800" />
                </div>

                {/* Likes count & Caption */}
                <div className="px-3 pb-3 text-left space-y-1">
                  <div className="text-[10px] font-bold text-slate-900">
                    {(currentSlide.likes + (likedSlide ? 1 : 0)).toLocaleString('ru-RU')} отметок «Нравится»
                  </div>
                  <p className="text-[10px] text-slate-700 leading-tight line-clamp-2">
                    <strong className="text-slate-900">{currentSlide.organizer}</strong>{' '}
                    {currentSlide.caption}
                  </p>
                  <div className="text-[9px] text-slate-400 uppercase pt-0.5">2 часа назад</div>
                </div>

                {/* Slide indicator dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {INSTAGRAM_MOCKUP_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentSlideIndex ? 'bg-emerald-600 w-3' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Subtle floating badge */}
            <div className="absolute -bottom-3 bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-1.5 rounded-full shadow-lg text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Лента добрых дел Кыргызстана</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Dedicated Instagram Auth Chassis */}
          <div className="w-full max-w-[360px] sm:max-w-[380px] flex flex-col gap-3">
            {/* CARD 1: Main Auth Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-7 sm:p-9 text-center shadow-xs">
              {/* Brand Wordmark Logo */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    kadam<span className="text-emerald-600">.kg</span>
                  </span>
                </div>
              </div>

              {/* Instagram Subtitle Tone */}
              {authMode === 'signup' ? (
                <p className="text-xs font-semibold text-slate-500 leading-snug mb-5">
                  Зарегистрируйтесь, чтобы стать волонтёром Кыргызстана и получать официальные сертификаты.
                </p>
              ) : (
                <p className="text-xs font-semibold text-slate-500 leading-snug mb-5">
                  Войдите в kadam.kg, чтобы просматривать записи, часы и получать новые уведомления.
                </p>
              )}

              {/* Google Fast Action (Like Facebook Login in Instagram) */}
              <button
                type="button"
                onClick={handleQuickGoogleAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mb-4"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#fff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#fff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Войти через Google</span>
              </button>

              {/* Instagram Divider: ИЛИ */}
              <div className="flex items-center gap-3 my-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ИЛИ
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2 text-left">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Notification Card */}
              {isSuccess ? (
                <div className="py-4 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Добро пожаловать в kadam.kg!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Вы успешно вошли как <strong>{fullName || currentProfile.fullName}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToEvents}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Перейти к мероприятиям
                  </button>
                </div>
              ) : authMode === 'signup' ? (
                /* SIGN UP FORM (Instagram Style) */
                <form onSubmit={handleSignUpSubmit} className="space-y-2.5 text-left">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Имя и Фамилия"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Электронная почта"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Номер телефона (+996...)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all cursor-pointer"
                    >
                      {KYRGYZ_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c} (Кыргызстан)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-semibold"
                    >
                      {showPassword ? 'Скрыть' : 'Показ.'}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="pt-0.5 space-y-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((stepIdx) => (
                          <div
                            key={stepIdx}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength.score >= stepIdx
                                ? passwordStrength.colorClass
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {passwordStrength.label}
                      </div>
                    </div>
                  )}

                  {/* Extra Profile Customization Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowExtraSettings(!showExtraSettings)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>{showExtraSettings ? '▾ Скрыть доп. настройки' : '▸ Добавить фото и направления'}</span>
                    </button>

                    {showExtraSettings && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt="Фото профиля"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                          />
                          <div>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[11px] font-bold text-emerald-600 hover:underline"
                            >
                              Загрузить аватар
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleAvatarFile}
                              accept="image/*"
                              className="hidden"
                            />
                            <p className="text-[9px] text-slate-400">JPG, PNG до 8 МБ</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-700">Направления помощи:</div>
                          <div className="flex flex-wrap gap-1">
                            {VOLUNTEER_DIRECTIONS.slice(0, 5).map((dir) => {
                              const active = selectedDirections.includes(dir.label);
                              return (
                                <button
                                  key={dir.id}
                                  type="button"
                                  onClick={() => handleToggleDirection(dir.label)}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                                    active
                                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {dir.icon} {dir.label.split(' ')[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <p className="text-[10px] text-slate-400 text-center leading-normal pt-2">
                    Регистрируясь, вы принимаете <span className="text-slate-600 font-medium">Условия использования</span> и <span className="text-slate-600 font-medium">Кодекс волонтёра Кыргызстана</span>.
                  </p>

                  {/* Primary Register Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                </form>
              ) : (
                /* LOGIN FORM (Instagram Style) */
                <form onSubmit={handleLoginSubmit} className="space-y-3 text-left">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Телефон, имя пользователя или эл. адрес"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden transition-all pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-semibold"
                    >
                      {showPassword ? 'Скрыть' : 'Показ.'}
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Войти
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => alert('Ссылка для сброса пароля отправлена на ваш email.')}
                      className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* CARD 2: Bottom Switcher Card (Exact Instagram Pattern) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-center text-xs shadow-xs">
              {authMode === 'signup' ? (
                <p className="text-slate-600">
                  Есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer hover:underline"
                  >
                    Вход
                  </button>
                </p>
              ) : (
                <p className="text-slate-600">
                  У вас ещё нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer hover:underline"
                  >
                    Зарегистрируйтесь
                  </button>
                </p>
              )}
            </div>

            {/* App Badges (Instagram Style) */}
            <div className="text-center space-y-2 pt-2">
              <p className="text-[11px] text-slate-500">Установите приложение kadam.kg</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-semibold">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Play</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-semibold">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>App Store</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Instagram-Style Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-6 text-center text-[11px] text-slate-400 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <button onClick={onNavigateToEvents} className="hover:text-slate-700 transition-colors">
            О kadam.kg
          </button>
          <span>·</span>
          <button onClick={onNavigateToEvents} className="hover:text-slate-700 transition-colors">
            События Кыргызстана
          </button>
          <span>·</span>
          <button onClick={onNavigateToEvents} className="hover:text-slate-700 transition-colors">
            Электронная книжка
          </button>
          <span>·</span>
          <button onClick={onNavigateToEvents} className="hover:text-slate-700 transition-colors">
            Сертификаты
          </button>
          <span>·</span>
          <span className="hover:text-slate-700 transition-colors cursor-pointer">Помощь</span>
          <span>·</span>
          <span className="hover:text-slate-700 transition-colors cursor-pointer">Пресса</span>
          <span>·</span>
          <span className="hover:text-slate-700 transition-colors cursor-pointer">Конфиденциальность</span>
          <span>·</span>
          <span className="hover:text-slate-700 transition-colors cursor-pointer">Условия</span>
          <span>·</span>
          <span className="hover:text-slate-700 transition-colors cursor-pointer">Бишкек · Ош · Иссык-Куль</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-slate-400 text-[11px]">
          <span className="text-slate-500 font-medium">Русский (Кыргызстан)</span>
          <span>·</span>
          <span>© 2026 kadam.kg — Волонтёрская платформа Кыргызстана</span>
        </div>
      </footer>
    </div>
  );
};
