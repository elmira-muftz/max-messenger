# MAX Messenger

Веб-интерфейс для отправки и получения текстовых сообщений через
[GREEN-API](https://green-api.com/). Прототип дизайна вдохновлён
[MAX Messenger](https://web.max.ru/).

Приложение поддерживает две платформы GREEN-API — **WhatsApp** (по
умолчанию) и **MAX** (при появлении поддержки). Переключение
осуществляется одной переменной окружения.

---

## ✨ Возможности

- 🔐 Авторизация по `idInstance` + `apiTokenInstance` (GREEN-API).
- 💬 Создание чатов по номеру телефона (российский формат).
- 📤 Отправка текстовых сообщений (`sendMessage`).
- 📥 Получение входящих сообщений через HTTP-поллинг
  (`receiveNotification` → `deleteNotification`, интервал 3 сек).
- 🔒 Учётные данные хранятся только в `localStorage` (Zustand persist),
  в репозиторий не попадают.
- 🌙 Тёмная тема, минималистичный UI.
- 🚫 Только текст — без медиа, файлов и вложений.

---

## 🛠 Технологический стек

| Слой | Технология |
|------|-----------|
| Framework | React 19 |
| Build tool | Vite 7 |
| Язык | TypeScript 5.8 |
| Стили | Tailwind CSS v3 |
| Состояние | Zustand 5 + persist middleware |
| API | GREEN-API (HTTP, polling) |

---

## 📦 Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone git@github.com:elmira-muftz/max-messenger.git
cd max-messenger

# 2. Установить зависимости
npm install

# 3. (Опционально) Скопировать переменные окружения
cp .env.example .env.local
# По умолчанию VITE_API_PLATFORM=whatsapp — менять не обязательно.

# 4. Запустить dev-сервер
npm run dev
# → http://localhost:5173
```

Сборка production:

```bash
npm run build      # собирает в dist/
npm run preview    # локальный предпросмотр production-сборки
npm run lint       # ESLint (0 предупреждений)
```

---

## 🚀 Использование

1. **Войти** — на экране авторизации введите `idInstance` и
   `apiTokenInstance` из личного кабинета GREEN-API.
2. **Создать чат** — нажмите «Новый чат», введите номер телефона
   (например, `+7 (999) 123-45-67` или `89991234567`).
   Номер автоматически приводится к международному формату.
3. **Отправить сообщение** — введите текст, нажмите Enter
   (Shift+Enter — новая строка) или кнопку «Отправить».
4. **Получить ответ** — входящие сообщения подтягиваются автоматически
   каждые 3 секунды; они появляются в левой части окна чата.
5. **Выйти** — кнопка «Выход» в левой панели очищает креды и
   возвращает на экран авторизации.

---

## 🌐 Платформы (VITE_API_PLATFORM)

Переменная `VITE_API_PLATFORM` управляет форматом `chatId` и адресами
запросов к GREEN-API:

| Значение | Платформа | Формат chatId |
|----------|-----------|---------------|
| `whatsapp` (по умолчанию) | WhatsApp | `79991234567@c.us` |
| `max` | MAX | (будет добавлено) |

Абстракция реализована в `src/utils/phoneFormat.ts`. При появлении
поддержки MAX достаточно дописать одну ветку в `formatChatId()` —
остальной код менять не нужно.

---

## 📁 Структура проекта

```
src/
├── components/
│   ├── auth/
│   │   └── AuthScreen.tsx        # Экран авторизации
│   ├── chat/
│   │   ├── ChatLayout.tsx        # Двухпанельный layout
│   │   ├── ChatList.tsx          # Левая панель (список чатов)
│   │   ├── ChatWindow.tsx        # Правая панель (окно чата)
│   │   ├── MessageBubble.tsx     # Один пузырь сообщения
│   │   └── MessageInput.tsx      # Панель ввода
│   └── modals/
│       └── NewChatModal.tsx      # Модалка создания чата
├── services/
│   └── greenApi.ts               # Обёртка над GREEN-API
├── store/
│   └── useChatStore.ts           # Zustand-стор + persist
├── types/
│   └── index.ts                  # Общие типы
├── utils/
│   └── phoneFormat.ts            # Форматирование номеров
├── App.tsx                       # Роутинг auth/chat
├── index.css                     # Tailwind-директивы
└── main.tsx                      # Точка входа
```

---

## 🌍 Живая демонстрация

**Ссылка:** https://max-messenger-eta.vercel.app

---

## 📜 Скрипты

| Команда | Назначение |
|---------|-----------|
| `npm run dev` | Dev-сервер (Vite) |
| `npm run build` | Production-сборка |
| `npm run preview` | Предпросмотр production-сборки |
| `npm run lint` | Проверка ESLint |

---

## 🔐 Безопасность

- Учётные данные GREEN-API **не хранятся в репозитории**.
- `.env` и `.env.local` в `.gitignore`.
- Креды сохраняются только в `localStorage` браузера пользователя
  и удаляются по кнопке «Выход».
- Приложение — клиентский демо-проект; для production-использования
  потребуется серверный прокси для GREEN-API.