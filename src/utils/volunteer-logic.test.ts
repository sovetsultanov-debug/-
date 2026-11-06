import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterEvents,
  calculateVolunteerStats,
  validateCertificateFile,
  calculatePasswordStrength,
  validateRegistrationData,
} from './volunteer-logic';
import { VolunteerEvent, VolunteerCertificate } from '../types/volunteer';

const sampleEvents: VolunteerEvent[] = [
  {
    id: 'ev-1',
    title: 'Субботник в парке',
    description: 'Очистка территории от мусора и посадка деревьев',
    category: 'ecology',
    date: '2026-11-15',
    time: '10:00',
    location: 'Алматы',
    address: 'Парк 28 Панфиловцев',
    isOnline: false,
    requiredVolunteers: 20,
    registeredVolunteersCount: 15,
    organizerName: 'Зеленый Город',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09',
    perks: ['Часы в книжку', 'Бесплатное питание'],
    status: 'active',
    hoursGranted: 4,
  },
  {
    id: 'ev-2',
    title: 'Помощь приюту для бездомных животных',
    description: 'Выгул собак, уборка вольеров, кормление',
    category: 'animals',
    date: '2026-11-20',
    time: '12:00',
    location: 'Астана',
    address: 'ул. Сарыарка 12',
    isOnline: false,
    requiredVolunteers: 10,
    registeredVolunteersCount: 4,
    organizerName: 'Верный Друг',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c',
    perks: ['Часы в книжку', 'Мерч'],
    status: 'active',
    hoursGranted: 3,
  },
  {
    id: 'ev-3',
    title: 'Онлайн-уроки для детей из детских домов',
    description: 'Обучение основам программирования и английского языка онлайн',
    category: 'social',
    date: '2026-11-22',
    time: '16:00',
    location: 'Онлайн',
    address: 'Zoom',
    isOnline: true,
    requiredVolunteers: 5,
    registeredVolunteersCount: 5,
    organizerName: 'Цифровое Будущее',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    perks: ['Электронный сертификат'],
    status: 'active',
    hoursGranted: 2,
  },
];

test('filterEvents correctly filters by category', () => {
  const ecologyEvents = filterEvents(sampleEvents, { category: 'ecology' });
  assert.equal(ecologyEvents.length, 1);
  assert.equal(ecologyEvents[0].id, 'ev-1');

  const animalEvents = filterEvents(sampleEvents, { category: 'animals' });
  assert.equal(animalEvents.length, 1);
  assert.equal(animalEvents[0].id, 'ev-2');

  const allEvents = filterEvents(sampleEvents, { category: 'all' });
  assert.equal(allEvents.length, 3);
});

test('filterEvents filters by online format', () => {
  const onlineOnly = filterEvents(sampleEvents, { isOnlineOnly: true });
  assert.equal(onlineOnly.length, 1);
  assert.equal(onlineOnly[0].isOnline, true);
});

test('filterEvents searches by keyword', () => {
  const matchDog = filterEvents(sampleEvents, { searchQuery: 'собак' });
  assert.equal(matchDog.length, 1);
  assert.equal(matchDog[0].id, 'ev-2');

  const matchOrganizer = filterEvents(sampleEvents, { searchQuery: 'Зеленый' });
  assert.equal(matchOrganizer.length, 1);
  assert.equal(matchOrganizer[0].id, 'ev-1');
});

test('calculateVolunteerStats sums hours and assigns proper badge level', () => {
  const certs: VolunteerCertificate[] = [
    {
      id: 'c1',
      title: 'Сертификат эко-марафона',
      issuer: 'Минэкологии',
      issueDate: '2026-05-10',
      imageUrl: '',
      hoursCredited: 15,
      verified: true,
    },
    {
      id: 'c2',
      title: 'Благодарность за помощь приюту',
      issuer: 'Верный Друг',
      issueDate: '2026-08-20',
      imageUrl: '',
      hoursCredited: 10,
      verified: true,
    },
  ];

  const stats = calculateVolunteerStats(certs, 6);
  assert.equal(stats.totalHours, 25);
  assert.equal(stats.certificateCount, 2);
  assert.equal(stats.completedEventsCount, 6);
  assert.equal(stats.badgeLevel, 'Активист'); // >= 20 hours
});

test('validateCertificateFile enforces size and extension rules', () => {
  const validImage = validateCertificateFile({
    name: 'certificate.jpg',
    size: 2 * 1024 * 1024,
    type: 'image/jpeg',
  });
  assert.equal(validImage.valid, true);

  const oversized = validateCertificateFile({
    name: 'huge_scan.png',
    size: 15 * 1024 * 1024,
    type: 'image/png',
  });
  assert.equal(oversized.valid, false);
  assert.ok(oversized.error?.includes('превышает'));

  const invalidExt = validateCertificateFile({
    name: 'document.exe',
    size: 1024,
    type: 'application/octet-stream',
  });
  assert.equal(invalidExt.valid, false);
  assert.ok(invalidExt.error?.includes('формат'));
});

test('calculatePasswordStrength evaluates passwords correctly', () => {
  const empty = calculatePasswordStrength('');
  assert.equal(empty.score, 0);

  const weak = calculatePasswordStrength('12345');
  assert.equal(weak.score, 1);

  const medium = calculatePasswordStrength('secret12');
  assert.equal(medium.score, 2);

  const strong = calculatePasswordStrength('SuperSecret123');
  assert.equal(strong.score, 3);
});

test('validateRegistrationData checks required credentials', () => {
  const invalidName = validateRegistrationData({
    fullName: '',
    email: 'test@kadam.kg',
    phone: '+996555123456',
  });
  assert.equal(invalidName.valid, false);

  const invalidEmail = validateRegistrationData({
    fullName: 'Усон',
    email: 'not-an-email',
    phone: '+996555123456',
  });
  assert.equal(invalidEmail.valid, false);

  const valid = validateRegistrationData({
    fullName: 'Усон Советбекович',
    email: 'sovetsultanov@gmail.com',
    phone: '+996555123456',
    password: 'securepassword123',
  });
  assert.equal(valid.valid, true);
});
