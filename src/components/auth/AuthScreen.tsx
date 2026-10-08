import { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { checkAuth } from '../../services/greenApi';

export const AuthScreen = () => {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useChatStore((s) => s.setAuth);
  const startPolling = useChatStore((s) => s.startPolling);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация: оба поля обязательны
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните оба поля');
      return;
    }

    setLoading(true);

    try {
      // Проверяем корректность учётных данных
      const isValid = await checkAuth(
        idInstance.trim(),
        apiTokenInstance.trim()
      );

      if (!isValid) {
        setError(
          'Не удалось авторизоваться. Проверьте idInstance и apiTokenInstance.'
        );
        setLoading(false);
        return;
      }

      // Сохраняем креды и запускаем поллинг
      setAuth(idInstance.trim(), apiTokenInstance.trim());
      startPolling();
      // Компонент будет размонтирован после setAuth (App переключится на ChatLayout)
      setLoading(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            MAX Messenger
          </h1>
          <p className="text-slate-400 text-sm">
            Войдите с данными GREEN-API
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="idInstance"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              idInstance
            </label>
            <input
              id="idInstance"
              type="text"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Например: 1101000000"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition"
            />
          </div>

          <div>
            <label
              htmlFor="apiTokenInstance"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              apiTokenInstance
            </label>
            <input
              id="apiTokenInstance"
              type="text"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Например: a1b2c3d4e5f6..."
              disabled={loading}
              className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition"
            />
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>

        {/* Подсказка */}
        <p className="mt-6 text-xs text-slate-500 text-center leading-relaxed">
          Получите idInstance и apiTokenInstance в личном кабинете{' '}
          <a
            href="https://green-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:underline"
          >
            green-api.com
          </a>
        </p>
      </div>
    </div>
  );
};