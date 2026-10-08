import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { sendMessage } from '../../services/greenApi';

interface MessageInputProps {
  chatId: string;
}

/**
 * Нижняя панель ввода: textarea + кнопка «Отправить».
 * - Enter — отправить, Shift+Enter — новая строка.
 * - Пустое сообщение не отправляется.
 * - Во время отправки кнопка и поле блокируются.
 */
export const MessageInput = ({ chatId }: MessageInputProps) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idInstance = useChatStore((s) => s.idInstance);
  const apiTokenInstance = useChatStore((s) => s.apiTokenInstance);
  const addMessage = useChatStore((s) => s.addMessage);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // При смене чата очищаем введённый текст и ошибку
  useEffect(() => {
    setText('');
    setError(null);
    textareaRef.current?.focus();
  }, [chatId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    if (!idInstance || !apiTokenInstance) {
      setError('Нет данных авторизации');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await sendMessage(idInstance, apiTokenInstance, {
        chatId,
        message: trimmed,
      });

      // Добавляем исходящее сообщение в store
      addMessage(chatId, {
        id: response.idMessage,
        chatId,
        text: trimmed,
        timestamp: Date.now(),
        isOutgoing: true,
      });

      setText('');
      textareaRef.current?.focus();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось отправить сообщение';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter без Shift — отправить
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
    // Shift+Enter — стандартное поведение (новая строка)
  };

  const isDisabled = isSending || !text.trim();

  return (
    <div className="border-t border-slate-700 bg-slate-800 px-4 py-3">
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          disabled={isSending}
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition max-h-32"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isDisabled}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSending ? 'Отправка...' : 'Отправить'}
        </button>
      </div>

      {/* Подсказка по горячим клавишам */}
      <p className="mt-1.5 text-[10px] text-slate-500">
        Enter — отправить, Shift+Enter — новая строка
      </p>
    </div>
  );
};