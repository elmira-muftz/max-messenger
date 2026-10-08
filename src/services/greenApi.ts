import type {
  SendMessageRequest,
  SendMessageResponse,
  Notification,
} from '../types';

// Базовый URL GREEN-API
const BASE_URL = 'https://api.green-api.com';

/**
 * Формирует URL для методов GREEN-API, требующих idInstance и apiTokenInstance.
 * Пример: https://api.green-api.com/waInstance1234567890/sendMessage/abcdef...
 */
const buildUrl = (
  idInstance: string,
  apiTokenInstance: string,
  method: string
): string => {
  return `${BASE_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}`;
};

/**
 * Отправляет текстовое сообщение в указанный чат.
 * Документация: https://green-api.com/v3/docs/api/sending/SendMessage/
 */
export const sendMessage = async (
  idInstance: string,
  apiTokenInstance: string,
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  const url = buildUrl(idInstance, apiTokenInstance, 'sendMessage');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatId: request.chatId,
      message: request.message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ошибка отправки сообщения (${response.status}): ${errorText}`
    );
  }

  return response.json();
};

/**
 * Получает одно уведомление из очереди (long polling не используется — обычный HTTP-запрос).
 * Возвращает null, если очередь пуста (GREEN-API возвращает 200 с пустым телом).
 * Документация: https://green-api.com/v3/docs/api/receiving/technology-http-api/
 */
export const receiveNotification = async (
  idInstance: string,
  apiTokenInstance: string
): Promise<Notification | null> => {
  const url = buildUrl(idInstance, apiTokenInstance, 'receiveNotification');

  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ошибка получения уведомления (${response.status}): ${errorText}`
    );
  }

  // GREEN-API возвращает пустое тело, если очередь пуста
  const text = await response.text();
  if (!text || text.trim() === '' || text === 'null') {
    return null;
  }

  try {
    return JSON.parse(text) as Notification;
  } catch {
    return null;
  }
};

/**
 * Удаляет обработанное уведомление из очереди.
 * Обязательный шаг — иначе одно и то же уведомление будет приходить снова.
 * Документация: https://green-api.com/v3/docs/api/receiving/technology-http-api/
 */
export const deleteNotification = async (
  idInstance: string,
  apiTokenInstance: string,
  receiptId: number
): Promise<void> => {
  const url = `${buildUrl(idInstance, apiTokenInstance, 'deleteNotification')}/${receiptId}`;

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ошибка удаления уведомления (${response.status}): ${errorText}`
    );
  }
};

/**
 * Проверяет корректность учётных данных (idInstance + apiTokenInstance).
 * Использует метод getStateInstance.
 * Документация: https://green-api.com/v3/docs/api/account/GetStateInstance/
 */
export const checkAuth = async (
  idInstance: string,
  apiTokenInstance: string
): Promise<boolean> => {
  try {
    const url = buildUrl(idInstance, apiTokenInstance, 'getStateInstance');
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) return false;

    const data = await response.json();
    // Если stateInstance === 'authorized', значит креды валидны и инстанс активен
    return data?.stateInstance === 'authorized';
  } catch {
    return false;
  }
};