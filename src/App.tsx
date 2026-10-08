import { useChatStore } from './store/useChatStore';
import { AuthScreen } from './components/auth/AuthScreen';
import { ChatLayout } from './components/chat/ChatLayout';

/**
 * Корневой компонент приложения.
 * Маршрутизация на уровне состояния:
 * - Есть креды (idInstance + apiTokenInstance) → ChatLayout
 * - Нет кредов → AuthScreen
 *
 * Благодаря persist middleware Zustand, после перезагрузки страницы
 * креды восстанавливаются из localStorage, и пользователь сразу
 * попадает в чат-интерфейс, минуя экран авторизации.
 */
function App() {
  const idInstance = useChatStore((s) => s.idInstance);
  const apiTokenInstance = useChatStore((s) => s.apiTokenInstance);

  const isAuthenticated = Boolean(idInstance && apiTokenInstance);

  return isAuthenticated ? <ChatLayout /> : <AuthScreen />;
}

export default App;