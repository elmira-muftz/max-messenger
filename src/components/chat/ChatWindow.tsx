import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { formatPhoneForDisplay } from '../../utils/phoneFormat';

/**
 * Правая панель: заголовок активного чата, прокручиваемый список сообщений,
 * нижняя панель ввода. Автоматически прокручивает вниз при новом сообщении.
 */
export const ChatWindow = () => {
  const activeChat = useChatStore((s) => s.activeChat);
  const chats = useChatStore((s) => s.chats);
  const messages = useChatStore((s) => s.messages);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const chat = activeChat ? chats[activeChat] : null;
  const chatMessages = activeChat ? messages[activeChat] ?? [] : [];

  // Автопрокрутка вниз при новом сообщении или смене чата
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, activeChat]);

  // Заглушка, если чат не выбран
  if (!activeChat || !chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-1">
            Выберите чат
          </p>
          <p className="text-slate-500 text-sm">
            или создайте новый, чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
      {/* Заголовок чата */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <h2 className="text-white font-medium">
          {formatPhoneForDisplay(chat.phoneNumber)}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5 truncate">
          {chat.chatId}
        </p>
      </div>

      {/* Список сообщений */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-2"
      >
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">
              Нет сообщений. Отправьте первое!
            </p>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Панель ввода */}
      <MessageInput chatId={activeChat} />
    </div>
  );
};