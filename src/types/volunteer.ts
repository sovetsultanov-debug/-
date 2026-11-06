export interface VolunteerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string;
  bio: string;
  birthDate?: string;
  skills: string[];
  registeredDate: string;
  notificationSettings: {
    newEventsAlert: boolean;
    reminders: boolean;
    emailAlerts: boolean;
    pushAlerts: boolean;
  };
}

export type EventCategory = 'ecology' | 'social' | 'animals' | 'sport' | 'culture' | 'emergency';

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  address: string;
  isOnline: boolean;
  requiredVolunteers: number;
  registeredVolunteersCount: number;
  organizerName: string;
  organizerAvatar?: string;
  imageUrl: string;
  perks: string[];
  status: 'active' | 'completed' | 'upcoming';
  hoursGranted: number;
}

export interface EventNotification {
  id: string;
  eventId?: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'new_event' | 'event_reminder' | 'certificate_awarded' | 'registration_accepted';
}

export interface VolunteerCertificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  imageUrl: string;
  hoursCredited: number;
  eventTitle?: string;
  verified: boolean;
  description?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  volunteerId: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'attended' | 'cancelled';
}
