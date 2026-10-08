import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import {
  formatChatId,
  formatPhoneForDisplay,
  isValidPhone,
} from '../../utils/phoneFormat';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно создания нового чата.
 * Закрывается по ESC, кнопке X или клику вне окна.
 * Валидирует российский номер (10 или 11 цифр), затем вызывает createChat().
 */
export const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createChat = useChatStore((s) => s.createChat);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус при открытии + сброс состояния при закрытии
  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setError(null);
      // Небольшая задержка, чтобы DOM успел отрисоваться
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Закрытие по ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = phone.trim();
    if (!trimmed) {
      setError('Введите номер телефона');
      return;
    }

    if (!isValidPhone(trimmed)) {
      setError('Неверный номер. Введите 10 или 11 цифр.');
      return;
    }

    const chatId = formatChatId(trimmed);
    // Извлекаем только цифры (без @c.us) для отображения в списке
    const phoneDigits = chatId.split('@')[0];

    createChat(chatId, phoneDigits);
    onClose();
  };

  // Если модал закрыт — не рендерим ничего
  if (!isOpen) return null;

  // Предпросмотр форматированного номера под input'ом
  const previewValid = phone.trim() && isValidPhone(phone);
  const preview = previewValid ? formatPhoneForDisplay(phone) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок + кнопка X */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">Новый чат</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label
              htmlFor="newChatPhone"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Номер телефона
            </label>
            <input
              id="newChatPhone"
              ref={inputRef}
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              placeholder="+7 (999) 123-45-67"
              className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />

            {/* Предпросмотр корректного номера */}
            {preview && (
              <p className="mt-1.5 text-xs text-emerald-400">
                Будет создан чат: {preview}
              </p>
            )}

            {/* Сообщение об ошибке */}
            {error && (
              <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Формат для WhatsApp: <code className="text-slate-400">7999xxxxxxx@c.us</code>
            <br />
            Российские номера: 8XXXXXXXXXX автоматически преобразуется в 7XXXXXXXXXX.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};