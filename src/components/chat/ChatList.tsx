import { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { formatPhoneForDisplay } from '../../utils/phoneFormat';

/**
 * Форматирует время последнего сообщения для превью в списке чатов.
 * Сегодня → HH:MM, вчера и раньше → DD.MM.YYYY
 */
const formatPreviewTime = (timestamp?: number): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

/**
 * Левая панель: заголовок, кнопки «Новый чат» и «Выход», список чатов.
 * Список отсортирован по времени последнего сообщения (свежие сверху).
 */
export const ChatList = () => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const chats = useChatStore((s) => s.chats);
  const activeChat = useChatStore((s) => s.activeChat);
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const logout = useChatStore((s) => s.logout);

  // Сортировка чатов по времени последнего сообщения (свежие сверху)
  const chatList = Object.values(chats).sort((a, b) => {
    const aTime = a.lastMessageTime ?? 0;
    const bTime = b.lastMessageTime ?? 0;
    return bTime - aTime;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-800 border-r border-slate-700">
      {/* Заголовок + кнопки */}
      <div className="px-4 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-lg">MAX Messenger</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-400 transition"
            title="Выйти из аккаунта"
          >
            Выход
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsNewChatOpen(true)}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
        >
          Новый чат
        </button>
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {chatList.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Пока нет чатов</p>
              <p className="text-slate-500 text-xs">
                Нажмите «Новый чат», чтобы начать
              </p>
            </div>
          </div>
        ) : (
          <ul>
            {chatList.map((chat) => {
              const isActive = chat.chatId === activeChat;
              return (
                <li key={chat.chatId}>
                  <button
                    type="button"
                    onClick={() => setActiveChat(chat.chatId)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-700/50 transition ${
                      isActive
                        ? 'bg-slate-700'
                        : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate">
                        {formatPhoneForDisplay(chat.phoneNumber)}
                      </span>
                      {chat.lastMessageTime && (
                        <span className="text-slate-500 text-[10px] ml-2 shrink-0">
                          {formatPreviewTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate">
                      {chat.lastMessage ?? 'Нет сообщений'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* TODO: NewChatModal будет добавлен на шаге 6 */}
      {isNewChatOpen && (
        <div className="hidden" aria-hidden="true" data-modal-placeholder />
      )}
    </div>
  );
};