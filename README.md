# Zustand Lessons

Учебное frontend-приложение для практики **Zustand**, **React**, **TypeScript**, **Ant Design** и **Panda CSS** на примере списка задач.

Проект демонстрирует разделение кода на `app`, `pages`, `features` и `entities`, работу с глобальным состоянием без API, модульные тесты через Vitest и E2E-тесты через Playwright.

## Возможности

- добавление задачи через общий input;
- редактирование задачи в том же input;
- сохранение по **Enter**, отмена редактирования по **Esc**;
- переключение статуса задачи checkbox;
- удаление всех завершённых задач;
- сброс состояния при перезагрузке страницы — сервер и постоянное хранилище не используются.

## Технологии

- React 19 и TypeScript 7;
- Vite 8 с HMR и sourcemaps в dev-режиме;
- Zustand 5;
- Ant Design 6;
- Panda CSS 2;
- Vitest 5 и Playwright.

## Требования

- Node.js `^20.19.0` или `>=22.12.0`;
- npm;
- Chromium для E2E-тестов, устанавливается отдельной командой из этого README.

## Запуск для разработки

```bash
npm ci
npm run dev
```

Открой адрес из терминала, обычно `http://localhost:5173`.

При установке зависимостей автоматически выполняется `npm run prepare`, который создаёт каталог `styled-system` для Panda CSS. Если генерацию нужно повторить вручную:

```bash
npm run prepare
```

Каталог `styled-system/` генерируется автоматически, не редактируется вручную и не хранится в Git.

Vite обновляет приложение при изменении исходников. Плагин Panda следит за стилями в `src` и обновляет сгенерированный CSS; отдельный watcher запускать не нужно.

## Работа с интерфейсом

1. Введи название задачи и нажми **Enter**.
2. Наведи курсор на карточку задачи и нажми иконку карандаша.
3. Название появится в общем input:
   - **Enter** сохраняет изменения;
   - **Esc** отменяет редактирование и очищает input.
4. Checkbox меняет статус задачи.
5. Кнопка «Удалить завершённые» появляется, когда есть завершённые задачи.

## Архитектура

```text
src/
  app/                    # корневая композиция приложения
  pages/todo-page/        # страница и координация сценариев
  features/
    todo-add/             # добавление и общий input для создания/редактирования
    todo-edit/            # обновление названия задачи
    todo-toggle/          # переключение статуса задачи
    todo-clear-completed/ # удаление завершённых задач
  entities/todo/
    model/                # типы и Zustand-store
    ui/TodoItem/          # отображение одной задачи
  main.tsx                # точка входа
  index.css               # порядок Panda cascade layers
panda.config.ts           # preflight и глобальные стили Panda
vite.config.ts            # Vite, Panda, Vitest и алиасы
playwright.config.ts      # конфигурация E2E-тестов
e2e/                      # пользовательские сценарии Playwright
styled-system/            # сгенерированные Panda helpers и типы
```

Импорты исходного кода выполняются через алиас `@/`, например `@/entities/todo/model`. Сгенерированные Panda helpers импортируются через `@styled-system/...`.

Стили пишутся через `css`/`cx` и patterns Panda, а не через CSS Modules. Глобальные стили находятся в `panda.config.ts`.

## Команды

| Команда                    | Назначение                              |
| -------------------------- | --------------------------------------- |
| `npm run dev`              | запуск Vite dev-сервера с HMR           |
| `npm run build`            | проверка TypeScript и production-сборка |
| `npm run preview`          | локальный просмотр production-сборки    |
| `npm run lint`             | проверка Oxlint                         |
| `npm run fmt`              | форматирование через Oxfmt              |
| `npm run fmt:check`        | проверка форматирования без изменений   |
| `npm test`                 | Vitest в watch-режиме                   |
| `npm run test:run`         | однократный запуск unit-тестов          |
| `npm run test:e2e:install` | установка Chromium для Playwright       |
| `npm run test:e2e`         | запуск E2E-тестов                       |
| `npm run prepare`          | генерация `styled-system`               |

## Дебаг в Chrome DevTools

### Исходный код

В dev-режиме Vite предоставляет sourcemaps для TypeScript/TSX. Во вкладке **Sources** найди исходники через **Page** или `Ctrl+P` / `Cmd+P`, например `TodoPage.tsx`. Можно ставить breakpoints, проверять состояние и пошагово выполнять код.

### CSS и Panda

Для dev-сервера включён `css.devSourcemap`. В **Elements → Styles** правила Panda находятся в cascade layers:

- `utilities` — стили из `css()` и patterns;
- `base` — глобальные стили из `panda.config.ts`;
- `reset` — Panda preflight;
- `tokens` — design tokens.

Sourcemap ведёт к **сгенерированному CSS**, а не к конкретному объекту `css({...})` в TSX. Чтобы найти исходный стиль, ищи в проекте соответствующее свойство или значение, например `line-through` или `gap: '16px'`.

Изменения в DevTools временные: после проверки их нужно вручную перенести в исходный код.

### Диагностика Panda

Разово посмотреть, какие стили Panda извлекла из конкретного компонента:

```bash
npx panda debug --include "src/entities/todo/ui/TodoItem/**"
```

Результаты сохраняются в `styled-system/debug/`, включая значения вызовов и их исходные позиции. Команда не работает в watch-режиме — после изменений её нужно запустить повторно.

Вывод в терминал без создания debug-файлов:

```bash
npx panda debug --dry --include "src/entities/todo/ui/TodoItem/**"
```

## Тесты и отладка сценариев

Unit-тесты находятся рядом с моделями в `src` и запускаются через Vitest:

```bash
npm test
npm run test:run
```

Перед первым запуском E2E-тестов установи Chromium локально в `node_modules`:

```bash
npm run test:e2e:install
npm run test:e2e
```

После повторной установки зависимостей через `npm ci` установку Chromium нужно повторить.

Playwright сам запускает Vite на `127.0.0.1:5173`; локально уже работающий dev-сервер используется повторно.

Полезные команды для отладки E2E:

```bash
# UI Playwright с пошаговым выполнением
npm run test:e2e -- --ui

# Видимый браузер
npm run test:e2e -- --headed

# Один файл
npm run test:e2e -- e2e/todo.spec.ts

# HTML-отчёт
npx playwright show-report
```

После падения теста trace находится в `test-results/`:

```bash
npx playwright show-trace test-results/<имя-каталога-теста>/trace.zip
```

## Проверка перед завершением изменений

```bash
npm run fmt:check
npm run lint
npm run test:run
npm run test:e2e
npm run build
```
