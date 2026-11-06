import React, { useState, useRef } from 'react';
import {
  Award,
  Upload,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Trash2,
  Download,
  ShieldCheck,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { VolunteerCertificate } from '../types/volunteer';
import { fileToBase64 } from '../services/storage';
import { formatRussianDate, validateCertificateFile } from '../utils/volunteer-logic';

interface CertificatesViewProps {
  certificates: VolunteerCertificate[];
  onAddCertificate: (newCert: VolunteerCertificate) => void;
  onDeleteCertificate: (id: string) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  onAddCertificate,
  onDeleteCertificate,
}) => {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedPreviewCert, setSelectedPreviewCert] = useState<VolunteerCertificate | null>(null);

  // Form states for certificate upload
  const [title, setTitle] = useState<string>('');
  const [issuer, setIssuer] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hoursCredited, setHoursCredited] = useState<number>(8);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCreditedHours = certificates.reduce((sum, c) => sum + (c.hoursCredited || 0), 0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateCertificateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      setFormError(validation.error || 'Неверный формат файла');
      return;
    }

    try {
      setFormError(null);
      const base64 = await fileToBase64(file);
      setPreviewImage(base64);
    } catch {
      setFormError('Не удалось прочитать файл сертификата.');
    }
  };

  const handleSubmitCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) {
      setFormError('Пожалуйста, укажите название сертификата и выдавшую организацию.');
      return;
    }

    if (!previewImage) {
      setFormError('Пожалуйста, загрузите изображение или скан сертификата.');
      return;
    }

    setIsSubmitting(true);

    const newCert: VolunteerCertificate = {
      id: `cert-${Date.now()}`,
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      imageUrl: previewImage,
      hoursCredited: Number(hoursCredited) || 0,
      eventTitle: eventTitle.trim() || undefined,
      description: description.trim() || undefined,
      verified: true, // Auto-verified in prototype
    };

    onAddCertificate(newCert);

    // Reset and close
    setTitle('');
    setIssuer('');
    setEventTitle('');
    setDescription('');
    setPreviewImage('');
    setFormError(null);
    setIsSubmitting(false);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-left z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-200" />
            <span>Официальное портфолио волонтёра</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Сертификаты и подтверждения часов
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl leading-relaxed">
            Загружайте сертификаты, грамоты и благодарственные письма с мероприятий.
            Все часы суммируются в вашу электронную волонтёрскую книжку!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-center min-w-[140px]">
            <span className="text-[11px] text-amber-200 block font-medium">Всего часов</span>
            <span className="text-2xl font-black text-white">{totalCreditedHours} ч.</span>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white hover:bg-amber-50 text-slate-900 font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 transition-transform hover:scale-105 shadow-md"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Загрузить сертификат</span>
          </button>
        </div>

        {/* Decorative blur */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Certificate Image Thumbnail */}
              <div
                onClick={() => setSelectedPreviewCert(cert)}
                className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5">
                  {cert.verified && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Верифицирован</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    +{cert.hoursCredited} ч.
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-4 space-y-2">
                <h3
                  onClick={() => setSelectedPreviewCert(cert)}
                  className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2"
                >
                  {cert.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  Кем выдан: <span className="text-slate-800">{cert.issuer}</span>
                </p>

                {cert.eventTitle && (
                  <p className="text-[11px] text-slate-500 truncate">
                    Событие: {cert.eventTitle}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatRussianDate(cert.issueDate)}
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    {cert.hoursCredited} волонтёрских часов
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedPreviewCert(cert)}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Открыть скан</span>
              </button>

              <button
                onClick={() => onDeleteCertificate(cert.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                title="Удалить сертификат"
                aria-label="Удалить сертификат"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Award className="w-12 h-12 mx-auto text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Вы ещё не загрузили сертификаты</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Загрузите скан или фото сертификата за участие в волонтёрских проектах, чтобы часы зачлись в ваш профиль.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
          >
            Загрузить первый сертификат
          </button>
        </div>
      )}

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Добавить сертификат или грамоту</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCertificate} className="p-6 space-y-4 text-xs text-slate-700">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* File upload zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Скан или фото сертификата *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/40 relative overflow-hidden min-h-[140px] flex flex-col items-center justify-center"
                >
                  {previewImage ? (
                    <div className="relative w-full h-32 flex items-center justify-center">
                      <img
                        src={previewImage}
                        alt="Предпросмотр сертификата"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                      />
                      <span className="absolute bottom-1 right-1 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded">
                        Нажмите, чтобы заменить
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-1.5" />
                      <p className="font-semibold text-slate-800 text-xs">
                        Выберите файл или перетащите сюда
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Форматы JPG, PNG, WEBP, PDF (до 8 МБ)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Title & Issuer */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Название сертификата / грамоты *
                </label>
                <input
                  type="text"
                  placeholder="Например: Сертификат за вклад в озеленение города"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Кем выдан (Организация / Фонд) *
                </label>
                <input
                  type="text"
                  placeholder="Например: Общество Красного Полумесяца КР / Мэрия г. Бишкек"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Дата выдачи
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Засчитать часов в книжку
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={hoursCredited}
                    onChange={(e) => setHoursCredited(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Связанное мероприятие (опционально)
                </label>
                <input
                  type="text"
                  placeholder="Например: Большой весенний субботник"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Сохранение...' : 'Добавить в портфолио'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Certificate Viewer Modal */}
      {selectedPreviewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 truncate">
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {selectedPreviewCert.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreviewCert(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center bg-slate-900/5">
              <img
                src={selectedPreviewCert.imageUrl}
                alt={selectedPreviewCert.title}
                className="max-h-[550px] w-auto object-contain rounded-xl shadow-lg border border-slate-200"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{selectedPreviewCert.issuer}</span>
                  <span className="text-emerald-600 font-semibold">
                    (+{selectedPreviewCert.hoursCredited} часов в книжке)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Выдан: {formatRussianDate(selectedPreviewCert.issueDate)}
                  {selectedPreviewCert.description ? ` • ${selectedPreviewCert.description}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewCert.imageUrl}
                  download="certificate.png"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать оригинал</span>
                </a>
                <button
                  onClick={() => setSelectedPreviewCert(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
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
