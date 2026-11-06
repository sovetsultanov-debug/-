import {
  VolunteerProfile,
  VolunteerEvent,
  EventNotification,
  VolunteerCertificate,
  EventRegistration,
} from '../types/volunteer';

const PROFILE_KEY = 'kadam_kg_profile_v1';
const EVENTS_KEY = 'kadam_kg_events_v1';
const NOTIFICATIONS_KEY = 'kadam_kg_notifications_v1';
const CERTIFICATES_KEY = 'kadam_kg_certificates_v1';
const REGISTRATIONS_KEY = 'kadam_kg_registrations_v1';

export const INITIAL_PROFILE: VolunteerProfile = {
  id: 'vol-user-1',
  fullName: 'Усон Советбекович',
  email: 'sovetsultanov@gmail.com',
  phone: '+996 (555) 345-678',
  city: 'Бишкек',
  avatarUrl: '/assets/aistudio/WhatsApp_Image_2026-10-23_at_22.34.26_d4b42122.jpeg',
  bio: 'Привет! Я активный волонтёр платформы kadam.kg с 2024 года. Участвую в эко-субботниках в Ала-Арче, помогаю приютам для бездомных животных и координирую марафоны на Иссык-Куле. Верю, что каждый шаг (кадам) делает наш Кыргызстан лучше!',
  birthDate: '2002-05-18',
  skills: [
    'Экологические проекты',
    'Первая помощь',
    'Координация мероприятий',
    'Забота о животных',
    'Кыргызский и русский языки',
    'Фото/видео для соцсетей',
  ],
  registeredDate: '2024-03-12',
  notificationSettings: {
    newEventsAlert: true,
    reminders: true,
    emailAlerts: true,
    pushAlerts: true,
  },
};

export const INITIAL_EVENTS: VolunteerEvent[] = [
  {
    id: 'ev-1',
    title: 'Большой эко-субботник в природном парке Ала-Арча',
    description: 'Масштабная очистка популярных туристических троп национального природного парка Ала-Арча от пластика и мусора. Вместе сделаем горы Кыргызстана чище! Организаторы предоставляют перчатки, мешки, горячий чай и боорсоки.',
    category: 'ecology',
    date: '2026-11-14',
    time: '09:30 - 14:00',
    location: 'Бишкек',
    address: 'Природный парк Ала-Арча, центральные ворота',
    isOnline: false,
    requiredVolunteers: 35,
    registeredVolunteersCount: 24,
    organizerName: 'Движение «Таза Мурас»',
    organizerAvatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    perks: ['Часы в книжку kadam.kg (5 ч)', 'Горячий чай и боорсоки', 'Трансфер из Бишкека', 'Эко-шоппер'],
    status: 'active',
    hoursGranted: 5,
  },
  {
    id: 'ev-2',
    title: 'День заботы и социализации собак в приюте «Добрые руки»',
    description: 'В нашем приюте живут более 100 спасённых четвероногих друзей. Нам нужны добрые сердца для выгула, расчесывания шерсти и кормления. Проведите душевный выходной с питомцами, которым так нужно внимание!',
    category: 'animals',
    date: '2026-11-16',
    time: '11:00 - 15:00',
    location: 'Бишкек',
    address: 'с. Лебединовка, ул. Зелёная 18',
    isOnline: false,
    requiredVolunteers: 18,
    registeredVolunteersCount: 12,
    organizerName: 'Фонд защиты животных «Добрые руки»',
    organizerAvatar: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    perks: ['Часы в книжку (4 ч)', 'Благодарственное письмо', 'Угощения и чай', 'Море собачьей любви'],
    status: 'active',
    hoursGranted: 4,
  },
  {
    id: 'ev-3',
    title: 'Иссык-Кульский марафон «Run the Silk Road»',
    description: 'Ежегодный международный высокогорный забег на берегу жемчужины Кыргызстана — озера Иссык-Куль. Волонтёры задействованы на станциях освежения, награждении финишёров и навигации гостей из 25 стран мира.',
    category: 'sport',
    date: '2026-11-21',
    time: '07:30 - 14:00',
    location: 'Чолпон-Ата',
    address: 'Ипподром г. Чолпон-Ата, Иссык-Куль',
    isOnline: false,
    requiredVolunteers: 50,
    registeredVolunteersCount: 41,
    organizerName: 'Дирекция марафона Run the Silk Road',
    organizerAvatar: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    perks: ['Официальный сертификат kadam.kg', 'Фирменная ветровка и кепка', 'Ланч-бокс', 'Часы в книжку (6 ч)'],
    status: 'active',
    hoursGranted: 6,
  },
  {
    id: 'ev-4',
    title: '«Умный серебряный век»: онлайн-помощь пожилым людям в IT',
    description: 'Проведение индивидуальных 45-минутных онлайн-консультаций для бабушек и дедушек: как пользоваться порталом «Түндүк», онлайн-банкингом, видеозвонками WhatsApp и Telegram для связи с родными.',
    category: 'social',
    date: '2026-11-23',
    time: '14:00 - 17:00',
    location: 'Онлайн',
    address: 'Платформа Zoom (ссылка высылается)',
    isOnline: true,
    requiredVolunteers: 15,
    registeredVolunteersCount: 9,
    organizerName: 'НПО «Забота о старших Кыргызстана»',
    organizerAvatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    perks: ['Электронный верифицированный сертификат', 'Часы в книжку (3 ч)', 'Гибкий онлайн-график'],
    status: 'active',
    hoursGranted: 3,
  },
  {
    id: 'ev-5',
    title: 'Фестиваль традиционных войлочных ремёсел и юрт',
    description: 'Встреча гостей, помощь мастерицам в проведении мастер-классов по кураку и чию, координация этно-выставки и зоны национальных игр в парке Ынтымак.',
    category: 'culture',
    date: '2026-11-28',
    time: '10:00 - 18:00',
    location: 'Бишкек',
    address: 'Парк «Ынтымак-2», южная зона',
    isOnline: false,
    requiredVolunteers: 25,
    registeredVolunteersCount: 25,
    organizerName: 'Союз ремесленников Кыргызстана',
    organizerAvatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    perks: ['Сертификат участника', 'Бейдж волонтёра kadam.kg', 'Горячий обед', 'Часы (8 ч)'],
    status: 'upcoming',
    hoursGranted: 8,
  },
  {
    id: 'ev-6',
    title: 'Срочная фасовка гуманитарной помощи для горных сёл',
    description: 'Срочный сбор в распределительном центре Красного Полумесяца Кыргызстана. Формирование тёплых наборов и медикаментов для оперативной отправки.',
    category: 'emergency',
    date: '2026-11-12',
    time: '15:00 - 20:00',
    location: 'Бишкек',
    address: 'Бульвар Эркиндик 10, Общество Красного Полумесяца КР',
    isOnline: false,
    requiredVolunteers: 30,
    registeredVolunteersCount: 22,
    organizerName: 'Национальное Общество Красного Полумесяца КР',
    organizerAvatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    perks: ['Благодарность МЧС КР', 'Горячий чай и питание', 'Часы в книжку (5 ч)'],
    status: 'active',
    hoursGranted: 5,
  },
];

export const INITIAL_CERTIFICATES: VolunteerCertificate[] = [
  {
    id: 'cert-1',
    title: 'Сертификат активного волонтёра: «Таза Жашоо — Ала-Арча»',
    issuer: 'Министерство природных ресурсов и экологии КР',
    issueDate: '2025-09-24',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
    hoursCredited: 24,
    eventTitle: 'Национальная эко-кампания «Таза Жашоо»',
    verified: true,
    description: 'За выдающийся вклад в очистку ущелий Ала-Арча и координацию волонтёрского движения kadam.kg.',
  },
  {
    id: 'cert-2',
    title: 'Благодарственное письмо за заботу о бездомных животных',
    issuer: 'Фонд защиты животных «Добрые руки» (г. Бишкек)',
    issueDate: '2025-11-10',
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=800&q=80',
    hoursCredited: 16,
    eventTitle: 'Патронаж и социализация животных в приюте',
    verified: true,
    description: 'За регулярный выгул, заботу и помощь подопечным приюта.',
  },
  {
    id: 'cert-3',
    title: 'Сертификат волонтёра-координатора: Run the Silk Road',
    issuer: 'Дирекция марафона Run the Silk Road / Минкульт КР',
    issueDate: '2026-05-18',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    hoursCredited: 12,
    eventTitle: 'Международный марафон на Иссык-Куле 2026',
    verified: true,
    description: 'Координация зоны финиша и пункта регистрации участников марафона.',
  },
];

export const INITIAL_NOTIFICATIONS: EventNotification[] = [
  {
    id: 'notif-1',
    eventId: 'ev-6',
    title: 'Срочный сбор волонтёров!',
    message: 'Открыт набор на фасовку гуманитарной помощи Красного Полумесяца в Бишкеке. Присоединяйтесь!',
    createdAt: '2026-11-05T08:10:00Z',
    read: false,
    type: 'new_event',
  },
  {
    id: 'notif-2',
    eventId: 'ev-1',
    title: 'Новое эко-мероприятие на kadam.kg',
    message: 'Опубликован «Большой эко-субботник в природном парке Ала-Арча». Запись открыта!',
    createdAt: '2026-11-04T14:30:00Z',
    read: false,
    type: 'new_event',
  },
  {
    id: 'notif-3',
    eventId: 'ev-2',
    title: 'Напоминание о записи',
    message: 'Вы записаны на «День заботы в приюте Добрые руки» на 16 ноября в 11:00.',
    createdAt: '2026-11-03T09:15:00Z',
    read: true,
    type: 'registration_accepted',
  },
  {
    id: 'notif-4',
    title: 'Сертификат верифицирован!',
    message: 'Ваш сертификат «Almaty Half Marathon 2026» успешно проверен модератором (+12 часов в книжку).',
    createdAt: '2026-11-01T12:00:00Z',
    read: true,
    type: 'certificate_awarded',
  },
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-1',
    eventId: 'ev-2',
    volunteerId: 'vol-user-1',
    registeredAt: '2026-11-03T09:15:00Z',
    status: 'confirmed',
  },
];

// Helper functions for LocalStorage Persistence
export function loadProfile(): VolunteerProfile {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (!saved) return INITIAL_PROFILE;
    const parsed = JSON.parse(saved);
    let modified = false;
    if (!parsed.fullName || parsed.fullName === 'Айсулу Султанова') {
      parsed.fullName = 'Усон Советбекович';
      parsed.email = 'sovetsultanov@gmail.com';
      modified = true;
    } else if (/[ьЬ]/.test(parsed.fullName)) {
      parsed.fullName = parsed.fullName.replace(/[ьЬ]/g, '');
      modified = true;
    }
    if (
      !parsed.avatarUrl ||
      parsed.avatarUrl.includes('unsplash.com') ||
      (!parsed.avatarUrl.startsWith('data:image') &&
        !parsed.avatarUrl.includes('WhatsApp_Image') &&
        !parsed.avatarUrl.includes('avatar_gojo'))
    ) {
      parsed.avatarUrl = '/assets/aistudio/WhatsApp_Image_2026-10-23_at_22.34.26_d4b42122.jpeg';
      modified = true;
    }
    if (modified) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...INITIAL_PROFILE, ...parsed }));
    }
    return { ...INITIAL_PROFILE, ...parsed };
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: VolunteerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function loadEvents(): VolunteerEvent[] {
  try {
    const saved = localStorage.getItem(EVENTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  } catch {
    return INITIAL_EVENTS;
  }
}

export function saveEvents(events: VolunteerEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events:', err);
  }
}

export function loadNotifications(): EventNotification[] {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: EventNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function loadCertificates(): VolunteerCertificate[] {
  try {
    const saved = localStorage.getItem(CERTIFICATES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  } catch {
    return INITIAL_CERTIFICATES;
  }
}

export function saveCertificates(certificates: VolunteerCertificate[]): void {
  try {
    localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
  } catch (err) {
    console.error('Failed to save certificates:', err);
  }
}

export function loadRegistrations(): EventRegistration[] {
  try {
    const saved = localStorage.getItem(REGISTRATIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  } catch {
    return INITIAL_REGISTRATIONS;
  }
}

export function saveRegistrations(regs: EventRegistration[]): void {
  try {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
  } catch (err) {
    console.error('Failed to save registrations:', err);
  }
}

/**
 * Convert a File object to Base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Не удалось прочитать файл как Base64'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
