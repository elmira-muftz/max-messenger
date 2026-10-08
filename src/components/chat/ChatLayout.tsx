import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';

/**
 * Основной layout приложения: слева список чатов (320px), справа окно чата.
 * Занимает всю высоту экрана.
 *
 * Адаптивность: на экранах < 768px левая панель скрывается.
 * (Опциональное поведение — toggle можно добавить позже.)
 */
export const ChatLayout = () => {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-900">
      {/* Левая панель — список чатов */}
      <aside className="hidden md:block w-80 shrink-0">
        <ChatList />
      </aside>

      {/* Правая панель — окно чата */}
      <main className="flex-1 flex min-w-0">
        <ChatWindow />
      </main>
    </div>
  );
};