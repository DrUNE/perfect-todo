import { expect, type Page } from '@playwright/test';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Ждём окончания анимаций (в том числе View Transition), чтобы измерять итоговое положение элементов. */
export const waitForAnimations = (page: Page) =>
  page.waitForFunction('document.getAnimations().length === 0');

/** Суффикс имени строки у выполненной задачи. */
export const doneSuffix = /, выполнено$/;

export const newTodoInput = (page: Page) => page.getByRole('textbox', { name: 'Новая задача' });

/** Строка задачи по названию (с пометкой «выполнено» или без неё). */
export const todoRow = (page: Page, title: string) =>
  page.getByRole('listitem', { name: new RegExp(`^${escapeRegExp(title)}(, выполнено)?$`) });

export const todoRows = (page: Page) => page.getByRole('listitem');

/** Названия задач сверху вниз, без пометки о статусе. */
export const todoTitles = (page: Page) =>
  todoRows(page).evaluateAll((elements) =>
    elements.map((element) =>
      (element.getAttribute('aria-label') ?? '').replace(/, выполнено$/, ''),
    ),
  );

export const addTodo = async (page: Page, title: string) => {
  const input = newTodoInput(page);

  await input.fill(title);
  await input.press('Enter');
  // Добавление применяется внутри View Transition, то есть чуть позже нажатия Enter.
  if (title.trim()) {
    await expect(todoRow(page, title)).toBeVisible();
  }
};

/** Отметить задачу кнопкой (устройства с мышью). */
export const markDone = (page: Page, title: string) =>
  todoRow(page, title).getByRole('button', { name: 'Отметить как сделанное' }).click();

/** Горизонтальный свайп пальцем по строке задачи (distance > 0 вправо, < 0 влево): события касаний через CDP, в Chromium они дают pointer-события. */
export const swipeRow = async (page: Page, title: string, distance = 120) => {
  // Пока идёт View Transition, страницу закрывает слой перехода и касания уходят в корневой элемент.
  await waitForAnimations(page);

  const box = await todoRow(page, title).boundingBox();

  if (!box) {
    throw new Error(`Строка «${title}» не найдена`);
  }

  const client = await page.context().newCDPSession(page);
  const y = box.y + box.height / 2;
  // Начинаем с той стороны строки, куда свайп не упрётся в край экрана, и не на кнопках справа.
  const startX = distance < 0 ? box.x + box.width - 80 : box.x + 40;
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number) =>
    client.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
    });

  await touch('touchStart', startX);

  // Движение с паузами и короткая остановка перед отпусканием, как у настоящего пальца: от мгновенного жеста
  // Chromium считает скорость огромной и запускает инерцию, а тап во время инерции кликом не засчитывается.
  for (let step = 1; step <= 8; step++) {
    await touch('touchMove', startX + (distance * step) / 8);
    await page.waitForTimeout(16);
  }

  await page.waitForTimeout(120);
  await touch('touchEnd', startX + distance);
  await client.detach();
};
