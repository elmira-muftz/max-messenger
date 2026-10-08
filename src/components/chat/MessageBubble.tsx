import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Форматирует timestamp (Unix ms) в HH:MM.
 */
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Один пузырь сообщения.
 * - Исходящие (isOutgoing=true): справа, зелёный фон.
 * - Входящие (isOutgoing=false): слева, тёмно-серый фон.
 */
export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { text, timestamp, isOutgoing } = message;

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
          isOutgoing
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-slate-700 text-slate-100 rounded-bl-sm'
        }`}
      >
        {/* Текст сообщения — сохраняем переносы строк */}
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>

        {/* Время отправки */}
        <p
          className={`text-[10px] mt-1 text-right ${
            isOutgoing ? 'text-emerald-100/80' : 'text-slate-400'
          }`}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};