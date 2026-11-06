import { VolunteerEvent, EventCategory, VolunteerCertificate } from '../types/volunteer';

export interface FilterOptions {
  category?: EventCategory | 'all';
  searchQuery?: string;
  isOnlineOnly?: boolean;
}

/**
 * Filter events by category, text query, and format
 */
export function filterEvents(
  events: VolunteerEvent[],
  options: FilterOptions
): VolunteerEvent[] {
  const { category = 'all', searchQuery = '', isOnlineOnly = false } = options;
  const query = searchQuery.trim().toLowerCase();

  return events.filter((ev) => {
    // Category check
    if (category !== 'all' && ev.category !== category) {
      return false;
    }

    // Format check
    if (isOnlineOnly && !ev.isOnline) {
      return false;
    }

    // Text search query
    if (query) {
      const matchTitle = ev.title.toLowerCase().includes(query);
      const matchDesc = ev.description.toLowerCase().includes(query);
      const matchLoc = ev.location.toLowerCase().includes(query) || ev.address.toLowerCase().includes(query);
      const matchOrg = ev.organizerName.toLowerCase().includes(query);
      const matchPerks = ev.perks.some((p) => p.toLowerCase().includes(query));

      if (!matchTitle && !matchDesc && !matchLoc && !matchOrg && !matchPerks) {
        return false;
      }
    }

    return true;
  });
}

export interface VolunteerStats {
  totalHours: number;
  certificateCount: number;
  completedEventsCount: number;
  badgeLevel: string;
  badgeColor: string;
}

/**
 * Calculates volunteer hours, certificates count, and badge level
 */
export function calculateVolunteerStats(
  certificates: VolunteerCertificate[],
  attendedEventsCount: number
): VolunteerStats {
  const certificateHours = certificates.reduce((acc, c) => acc + (c.hoursCredited || 0), 0);
  const totalHours = certificateHours;

  let badgeLevel = 'Новичок';
  let badgeColor = '#94A3B8'; // Slate

  if (totalHours >= 100 || attendedEventsCount >= 20) {
    badgeLevel = 'Почётный волонтёр';
    badgeColor = '#F59E0B'; // Amber / Gold
  } else if (totalHours >= 50 || attendedEventsCount >= 10) {
    badgeLevel = 'Лидер добра';
    badgeColor = '#8B5CF6'; // Purple
  } else if (totalHours >= 20 || attendedEventsCount >= 5) {
    badgeLevel = 'Активист';
    badgeColor = '#10B981'; // Emerald
  } else if (totalHours >= 5 || attendedEventsCount >= 1) {
    badgeLevel = 'Волонтёр';
    badgeColor = '#06B6D4'; // Cyan
  }

  return {
    totalHours,
    certificateCount: certificates.length,
    completedEventsCount: attendedEventsCount,
    badgeLevel,
    badgeColor,
  };
}

/**
 * Validates certificate file before upload
 */
export function validateCertificateFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  const maxBytes = 8 * 1024 * 1024; // 8MB limit
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (file.size > maxBytes) {
    return { valid: false, error: 'Размер файла превышает допустимый лимит 8 МБ' };
  }

  // Check extension or mime
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

  if (!allowedExts.includes(ext || '') && !allowedMime.includes(file.type)) {
    return {
      valid: false,
      error: 'Недопустимый формат файла. Поддерживаются JPG, PNG, WEBP и PDF',
    };
  }

  return { valid: true };
}

/**
 * Format Russian date string nicely
 */
export function formatRussianDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  percent: number; // 0 to 100
  label: string;
  colorClass: string;
}

/**
 * Calculates Apple-style password strength score (0-4)
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, percent: 0, label: 'Введите пароль', colorClass: 'bg-slate-200' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) || /[А-Я]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score: 1, percent: 25, label: 'Слабый пароль', colorClass: 'bg-rose-500' };
  }
  if (score === 2) {
    return { score: 2, percent: 50, label: 'Средний пароль', colorClass: 'bg-amber-500' };
  }
  if (score === 3) {
    return { score: 3, percent: 75, label: 'Надёжный пароль', colorClass: 'bg-emerald-500' };
  }
  return { score: 4, percent: 100, label: 'Отличный пароль', colorClass: 'bg-emerald-600' };
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  city?: string;
}

/**
 * Validates registration input fields
 */
export function validateRegistrationData(data: RegistrationPayload): { valid: boolean; error?: string } {
  if (!data.fullName || data.fullName.trim().length < 2) {
    return { valid: false, error: 'Пожалуйста, укажите имя и фамилию' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    return { valid: false, error: 'Пожалуйста, введите корректный адрес электронной почты' };
  }

  if (data.phone && data.phone.trim().length < 6) {
    return { valid: false, error: 'Пожалуйста, укажите контактный номер телефона' };
  }

  if (data.password !== undefined && data.password.length < 6) {
    return { valid: false, error: 'Пароль должен содержать не менее 6 символов' };
  }

  return { valid: true };
}
