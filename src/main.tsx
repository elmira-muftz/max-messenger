import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useChatStore } from './store/useChatStore';

/**
 * DEV-only: экспонируем Zustand-стор в window для отладки и mock-тестов.
 * В production-сборке этот блок полностью удаляется (import.meta.env.DEV === false),
 * поэтому никакого влияния на финальный бандл не оказывает.
 *
 * Использование в консоли браузера (dev):
 *   window.__store.getState().createChat('79991234567@c.us', '79991234567')
 */
if (import.meta.env.DEV) {
  (window as unknown as { __store: typeof useChatStore }).__store =
    useChatStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);