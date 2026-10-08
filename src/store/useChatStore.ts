import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Chat } from '../types';
import {
  receiveNotification,
  deleteNotification,
} from '../services/greenApi';

interface ChatState {
  // ===== Авторизация =====
  idInstance: string;
  apiTokenInstance: string;
  setAuth: (id: string, token: string) => void;
  logout: () => void;

  // ===== Чаты =====
  chats: Record<string, Chat>;
  messages: Record<string, Message[]>; // ключ — chatId
  activeChat: string | null;

  createChat: (chatId: string, phoneNumber: string) => void;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;

  // ===== Поллинг =====
  isPolling: boolean;
  pollingError: string | null;
  startPolling: () => void;
  stopPolling: () => void;

  // Внутренняя функция обработки одного цикла поллинга
  _pollOnce: () => Promise<void>;
}

// Интервал поллинга в миллисекундах
const POLLING_INTERVAL_MS = 3000;

// Ссылка на активный таймер (не в state, чтобы не вызывать ре-рендеры)
let pollingTimer: ReturnType<typeof setInterval> | null = null;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // ===== Авторизация =====
      idInstance: '',
      apiTokenInstance: '',

      setAuth: (id, token) =>
        set({ idInstance: id, apiTokenInstance: token }),

      logout: () => {
        // Останавливаем поллинг перед выходом
        get().stopPolling();
        set({
          idInstance: '',
          apiTokenInstance: '',
          chats: {},
          messages: {},
          activeChat: null,
          pollingError: null,
        });
      },

      // ===== Чаты =====
      chats: {},
      messages: {},
      activeChat: null,

      createChat: (chatId, phoneNumber) => {
        const { chats } = get();
        if (chats[chatId]) return; // уже существует

        set({
          chats: {
            ...chats,
            [chatId]: { chatId, phoneNumber },
          },
          messages: {
            ...get().messages,
            [chatId]: get().messages[chatId] ?? [],
          },
          activeChat: chatId,
        });
      },

      setActiveChat: (chatId) => set({ activeChat: chatId }),

      addMessage: (chatId, message) => {
        const { messages, chats } = get();
        const existing = messages[chatId] ?? [];

        // Защита от дублей по id
        if (existing.some((m) => m.id === message.id)) return;

        const updatedMessages = {
          ...messages,
          [chatId]: [...existing, message],
        };

        // Обновляем превью чата
        const updatedChats = {
          ...chats,
          [chatId]: {
            ...(chats[chatId] ?? {
              chatId,
              phoneNumber: chatId.split('@')[0],
            }),
            lastMessage: message.text,
            lastMessageTime: message.timestamp,
          },
        };

        set({ messages: updatedMessages, chats: updatedChats });
      },

      // ===== Поллинг =====
      isPolling: false,
      pollingError: null,

      startPolling: () => {
        const { isPolling, idInstance, apiTokenInstance } = get();
        if (isPolling) return;
        if (!idInstance || !apiTokenInstance) return;

        set({ isPolling: true, pollingError: null });

        pollingTimer = setInterval(() => {
          void get()._pollOnce();
        }, POLLING_INTERVAL_MS);

        // Первый цикл сразу, не ждём 3 секунды
        void get()._pollOnce();
      },

      stopPolling: () => {
        if (pollingTimer) {
          clearInterval(pollingTimer);
          pollingTimer = null;
        }
        set({ isPolling: false });
      },

      _pollOnce: async () => {
        const { idInstance, apiTokenInstance, addMessage } = get();
        if (!idInstance || !apiTokenInstance) return;

        try {
          const notification = await receiveNotification(
            idInstance,
            apiTokenInstance
          );

          if (notification) {
            const { receiptId, body } = notification;

            // Обрабатываем только входящие текстовые сообщения
            if (
              body.typeWebhook === 'incomingMessageReceived' &&
              body.messageData?.typeMessage === 'textMessage' &&
              body.messageData?.textMessageData?.textMessage
            ) {
              const chatId = body.senderData.chatId;
              const text = body.messageData.textMessageData.textMessage;

              addMessage(chatId, {
                id: body.idMessage,
                chatId,
                text,
                timestamp: body.timestamp * 1000,
                isOutgoing: false,
              });
            }

            // Обязательно удаляем уведомление из очереди
            await deleteNotification(idInstance, apiTokenInstance, receiptId);
          }

          // Если ошибок не было — сбрасываем прошлую ошибку
          if (get().pollingError !== null) {
            set({ pollingError: null });
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Неизвестная ошибка поллинга';
          set({ pollingError: message });
        }
      },
    }),
    {
      name: 'max-messenger-storage', // ключ в localStorage
      // Сохраняем только учётные данные — сообщения эфемерны
      partialize: (state) => ({
        idInstance: state.idInstance,
        apiTokenInstance: state.apiTokenInstance,
      }),
    }
  )
);