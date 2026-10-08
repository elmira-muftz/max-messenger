import type { Platform } from '../types';

/**
 * Читает платформу из переменной окружения VITE_API_PLATFORM.
 * Если не задана, по умолчанию возвращает 'whatsapp'.
 */
export const getPlatform = (): Platform => {
  const envPlatform = import.meta.env.VITE_API_PLATFORM as string | undefined;
  if (envPlatform === 'max') return 'max';
  return 'whatsapp';
};

/**
 * Преобразует номер телефона в формат chatId, соответствующий платформе.
 * - WhatsApp: 79991234567 → 79991234567@c.us
 * - MAX:      (пока просто номер, формат будет добавлен позже)
 *
 * Для российских номеров: если номер начинается с 8, заменяет её на 7
 * (перевод из национального формата в международный).
 */
export const formatChatId = (
  phone: string,
  platform: Platform = getPlatform()
): string => {
  // Удаляет все лишние символы (пробелы, дефисы, скобки, +)
  let cleaned = phone.replace(/\D/g, '');

  // Приведение российского номера к международному формату: 8XXXXXXXXXX → 7XXXXXXXXXX
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  if (platform === 'whatsapp') {
    return `${cleaned}@c.us`;
  }

  // Формат для MAX будет добавлен здесь (пока заглушка)
  return cleaned;
};

/**
 * Извлекает только цифры из chatId (для отображения).
 * 79991234567@c.us → 79991234567
 */
export const extractPhoneFromChatId = (chatId: string): string => {
  const atIndex = chatId.indexOf('@');
  const raw = atIndex === -1 ? chatId : chatId.slice(0, atIndex);
  return raw.replace(/\D/g, '');
};

/**
 * Базовая валидация введённого пользователем номера.
 * Для российских номеров: должно быть 10 или 11 цифр.
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

/**
 * Отображает номер в удобочитаемом формате.
 * 79991234567 → +7 (999) 123-45-67
 */
export const formatPhoneForDisplay = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');

  // Если начинается с 8, заменяем на 7
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  // Если 10 цифр, добавляем 7 в начало
  if (cleaned.length === 10) {
    cleaned = '7' + cleaned;
  }

  if (cleaned.length !== 11) return phone;

  return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
};