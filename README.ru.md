# Startup Ecosystem Platform

MVP-платформа для фаундеров, инвесторов, стартапов и разработчиков. Демонстрирует AI-интеграцию, векторный поиск и полноценный product thinking на бесплатном стеке.

---

## Что умеет платформа

| Раздел | Функциональность |
|---|---|
| **Dashboard** | KPI-карточки: активные стартапы, инвесторы, сделки; график по стадиям |
| **Startups** | Полный CRUD — создание, редактирование, удаление профилей; поиск |
| **Investors** | Полный CRUD инвесторов; фильтр по стадиям и фокусу |
| **Deal Flow** | Kanban-доска — перетаскивание сделок по стадиям (Intro → Term Sheet → Closed) |
| **Fundraising** | Графики: история раундов, привлечённый капитал по стадиям |
| **Accelerator** | Каталог акселерационных программ со статусом заявки |
| **Events** | Управление мероприятиями: создание, просмотр предстоящих, участие |
| **Documents** | Загрузка pitch deck (PDF) → AI автоматически анализирует, ставит оценку и даёт советы |
| **Messages** | Внутренний чат между участниками платформы |
| **AI Assistant** | Чат с памятью разговора (последние 10 обменов) на базе Gemini 2.5 Flash Lite |

---

## Технологии

### Backend
- **FastAPI** — REST API с автоматической документацией Swagger
- **SQLAlchemy 2.0** — ORM с типизированными моделями
- **Alembic** — миграции базы данных
- **PostgreSQL 16 + pgvector** — реляционное хранилище + векторные эмбеддинги (768 dim)
- **JWT (python-jose + bcrypt)** — аутентификация

### AI / Векторный поиск
- **Google Gemini 2.5 Flash Lite** — LLM для анализа pitch deck и подбора инвесторов
- **models/gemini-embedding-001** — облачные эмбеддинги, 768 измерений
- **google-genai SDK** — прямые вызовы Gemini API для LLM и эмбеддингов
- **LangChain** — только загрузка/разбиение PDF (`PyPDFLoader`, `RecursiveCharacterTextSplitter`)
- **pgvector cosine similarity** — семантический подбор инвестор ↔ стартап

> Весь AI работает в облаке через один `GOOGLE_API_KEY` — никаких локальных моделей, работает на любом ноутбуке.

### Frontend
- **React 19 + Vite** — быстрый HMR, React Compiler
- **TypeScript** — полная типизация
- **Tailwind CSS** — утилитарные стили
- **TanStack Query v5** — серверный стейт, кэширование, мутации
- **Recharts** — графики на Dashboard
- **React Router v6** — SPA-навигация

### Инфраструктура (всё бесплатно)
| Сервис | Назначение |
|---|---|
| Docker | Локальный PostgreSQL 16 с pgvector |
| Neon.tech | Облачный PostgreSQL (продакшн) |
| Cloudinary | Хранение PDF и файлов |
| Render.com | Хостинг backend |
| Vercel | Хостинг frontend |

---

## Быстрый старт

### Требования
- Docker Desktop
- Python 3.11+ (проверено на 3.14)
- Node.js 18+
- API-ключ Google AI Studio → [aistudio.google.com](https://aistudio.google.com/apikey)

### 1. Запуск базы данных

```bash
cd startup-platform
docker compose up -d
```

Автоматически: создаёт PostgreSQL 16, включает расширение `pgvector`, создаёт все таблицы, заполняет тестовыми данными (10 стартапов, 8 инвесторов, 5 мероприятий).

### 2. Настройка backend

```bash
cd backend
cp .env.example .env
# Заполните .env: GOOGLE_API_KEY, CLOUDINARY_*, SECRET_KEY
```

### 3. Запуск backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-exclude venv --port 8000
```

Документация API: **http://localhost:8000/docs**

### 4. Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение: **http://localhost:5173**

---

## Структура проекта

```
startup-platform/
├── backend/
│   ├── app/
│   │   ├── main.py           # Точка входа FastAPI
│   │   ├── config.py         # Настройки через Pydantic BaseSettings
│   │   ├── database.py       # SQLAlchemy engine + инициализация pgvector
│   │   ├── models/           # ORM-модели (User, Startup, Investor, Deal, Event, Document)
│   │   ├── schemas/          # Pydantic-схемы запросов/ответов
│   │   ├── routers/          # Эндпоинты API (auth, startups, investors, deals, events, documents, ai)
│   │   └── services/
│   │       ├── ai_service.py     # google.genai: анализ pitch, подбор инвесторов, чат
│   │       ├── vector_service.py # Генерация эмбеддингов + поиск по pgvector
│   │       └── auth_service.py   # JWT + bcrypt
│   ├── tests/                # pytest-тесты (97 тестов)
│   ├── alembic/              # Миграции БД
│   ├── dbscripts/            # SQL-скрипты для ручной настройки
│   ├── docker-init/          # SQL для автоинициализации Docker
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   └── src/
│       ├── api/              # Axios-клиенты для каждого раздела
│       ├── components/       # Layout (Sidebar, RightPanel) + UI (Badge, Modal, ScoreRing...)
│       ├── pages/            # 11 страниц: Login, Dashboard, Startups, Investors, DealFlow...
│       ├── utils/            # Общие утилиты (format.ts + тесты)
│       └── types/            # TypeScript-интерфейсы
├── docker-compose.yml
├── .gitignore
├── README.en.md
└── README.ru.md
```

---

## Переменные окружения

```env
# PostgreSQL (Docker локально или Neon.tech в облаке)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/startupdb

# Google AI (LLM + Embeddings) — бесплатно на aistudio.google.com
GOOGLE_API_KEY=AIza...

# Аутентификация
SECRET_KEY=ваш-случайный-ключ-32-символа
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Хранилище файлов — бесплатно на cloudinary.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Приложение
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

---

## Как работает AI

1. **Анализ Pitch Deck** — пользователь загружает PDF → backend извлекает текст через `PyPDFLoader` → Gemini оценивает презентацию (0–100) по 6 параметрам (проблема, решение, рынок, команда, traction, финансы) и даёт рекомендации по улучшению.

2. **Подбор инвесторов** — описание стартапа конвертируется в вектор через `gemini-embedding-001` → pgvector по косинусному сходству находит топ-N наиболее совместимых инвесторов → Gemini объясняет, почему каждый инвестор подходит.

3. **AI-Ассистент** — ручное управление историей диалога (in-memory, последние 10 обменов) → `google.genai` передаёт полный контекст в Gemini → контекстные ответы об экосистеме стартапов.

---

## Тестирование

- **Backend**: 97 pytest-тестов — схемы, авторизация, AI-сервис (mock), API-эндпоинты (транзакционный откат)
- **Frontend**: 8 vitest-тестов — утилиты форматирования

```bash
cd backend && python -m pytest tests/ -v
cd frontend && npm test
```
