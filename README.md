# Zustand Lessons

Учебное frontend-приложение для практики **Zustand**, **React**, **TypeScript**, **GTK Adwaita** (`@gtk-js/adwaita`) на примере списка задач.

Проект демонстрирует простую структуру `app` + модули `todo` и `theme`, работу с глобальным состоянием без API, модульные тесты через Vitest и E2E-тесты через Playwright.

## Возможности

- добавление задачи через общий input;
- редактирование задачи в том же input;
- сохранение по **Enter**, отмена редактирования по **Esc**;
- переключение статуса задачи checkbox;
- удаление всех завершённых задач;
- переключение темы в трёх режимах: светлая, как в браузере, тёмная;
- сохранение выбранного режима темы в `localStorage`;
- сброс списка задач при перезагрузке страницы — сервер и постоянное хранилище задач не используются.

## Технологии

- React 19 и TypeScript 7;
- Vite 8 с HMR и sourcemaps в dev-режиме;
- Zustand 5;
- GTK Adwaita для React (`@gtk-js/adwaita`, `@gtk-js/icons-adwaita`);
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

Vite обновляет приложение при изменении исходников. Отдельный watcher запускать не нужно.

## Работа с интерфейсом

1. Введи название задачи и нажми **Enter**.
2. Наведи курсор на карточку задачи и нажми иконку карандаша.
3. Название появится в общем input:
   - **Enter** сохраняет изменения;
   - **Esc** отменяет редактирование и очищает input.
4. Checkbox меняет статус задачи.
5. Кнопка «Удалить завершённые» появляется, когда есть завершённые задачи.
6. Переключатель в правом верхнем углу выбирает тему:
   - солнце — светлая;
   - монитор — как в браузере, с реакцией на изменение системной темы;
   - луна — тёмная.

## Архитектура

```text
src/
  app/                    # AdwaitaProvider, шапка и композиция приложения
  todo/                   # Zustand-store и действия задач, страница и UI задач, тесты
  theme/                  # выбор и сохранение темы приложения
  shared/                 # useMediaQuery и useDeviceInfo (мобильное устройство, узкое окно, touch, мышь, сгиб)
  main.tsx                # точка входа
vite.config.ts            # Vite, Vitest и алиасы
playwright.config.ts      # конфигурация E2E-тестов
e2e/                      # пользовательские сценарии Playwright
```

Импорты исходного кода выполняются через алиас `@/`, например `@/todo/todoStore`.

Интерфейс собран из компонентов GTK Adwaita (`AdwaitaProvider`, `AdwPreferencesGroup`, `AdwActionRow`, `GtkEntry` и др.); тема и цвета задаются провайдером, собственных стилей нет.

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

## Дебаг в Chrome DevTools

### Исходный код

В dev-режиме Vite предоставляет sourcemaps для TypeScript/TSX. Во вкладке **Sources** найди исходники через **Page** или `Ctrl+P` / `Cmd+P`, например `TodoPage.tsx`. Можно ставить breakpoints, проверять состояние и пошагово выполнять код.

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
