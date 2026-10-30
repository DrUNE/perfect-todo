import { expect, test, type Page } from '@playwright/test';
import { doneSuffix, newTodoInput, todoRow, todoRows, todoTitles } from './helpers.js';

// Создаём задачи только клавиатурой: поле остаётся в фокусе после Enter.
const addTodosByKeyboard = async (page: Page, ...todoTitles: string[]) => {
  await newTodoInput(page).focus();

  for (const title of todoTitles) {
    await page.keyboard.type(title);
    await page.keyboard.press('Enter');
    // Добавление применяется внутри View Transition, то есть чуть позже нажатия Enter.
    await expect(todoRow(page, title)).toBeVisible();
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('creates several todos in a row without leaving the keyboard', async ({ page }) => {
  await addTodosByKeyboard(page, 'Раз', 'Два', 'Три');

  expect(await todoTitles(page)).toEqual(['Три', 'Два', 'Раз']);
  await expect(newTodoInput(page)).toBeFocused();
});

test('Tab enters the list with a single stop, arrows move between rows', async ({ page }) => {
  await addTodosByKeyboard(page, 'Первая', 'Вторая', 'Третья');

  // Tab из поля: единственная остановка списка — первая строка, кнопки внутри строк пропускаются.
  await page.keyboard.press('Tab');
  const rows = page.getByRole('listitem');

  await expect(rows.nth(0)).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(1)).toBeFocused();

  await page.keyboard.press('End');
  await expect(rows.nth(2)).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(2)).toBeFocused();

  await page.keyboard.press('Home');
  await expect(rows.nth(0)).toBeFocused();
});

test('Arrow Down from the input goes to the list and Arrow Up from the first row goes back', async ({
  page,
}) => {
  await addTodosByKeyboard(page, 'Первая', 'Вторая');

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listitem').nth(0)).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(newTodoInput(page)).toBeFocused();
});

test('the last focused row becomes the single Tab stop of the list', async ({ page }) => {
  await addTodosByKeyboard(page, 'Первая', 'Вторая', 'Третья');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');

  await expect(page.getByRole('listitem').nth(1)).toBeFocused();

  await newTodoInput(page).focus();
  await page.keyboard.press('Tab');

  await expect(page.getByRole('listitem').nth(1)).toBeFocused();
});

test('Space toggles the focused todo', async ({ page }) => {
  await addTodosByKeyboard(page, 'Задача');
  await page.keyboard.press('ArrowDown');

  await page.keyboard.press('Space');
  await expect(todoRow(page, 'Задача')).toHaveAccessibleName(doneSuffix);

  await page.keyboard.press('Space');
  await expect(todoRow(page, 'Задача')).not.toHaveAccessibleName(doneSuffix);
});

test('Enter edits in place, Enter saves and the focus returns to the row', async ({ page }) => {
  await addTodosByKeyboard(page, 'Старое');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await expect(editInput).toBeFocused();
  await expect(editInput).toHaveValue('Старое');

  await page.keyboard.type('Новое');
  await page.keyboard.press('Enter');

  await expect(todoRow(page, 'Новое')).toBeVisible();
  await expect(page.getByRole('listitem').nth(0)).toBeFocused();
});

test('F2 edits and Escape cancels returning the focus to the row', async ({ page }) => {
  await addTodosByKeyboard(page, 'Исходное');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('F2');
  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toBeFocused();
  await page.keyboard.type('Лишнее');
  await page.keyboard.press('Escape');

  await expect(todoRow(page, 'Исходное')).toBeVisible();
  await expect(page.getByRole('listitem').nth(0)).toBeFocused();
});

test('Tab out of the edited row saves the title', async ({ page }) => {
  await addTodosByKeyboard(page, 'Было');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toBeFocused();
  await page.keyboard.type('Стало');
  await page.keyboard.press('Tab');

  await expect(todoRow(page, 'Стало')).toBeVisible();
});

test('Delete removes the todo and moves the focus to the neighbour, Ctrl+Z restores it', async ({
  page,
}) => {
  await addTodosByKeyboard(page, 'Первая', 'Вторая', 'Третья');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');

  await page.keyboard.press('Delete');

  await expect.poll(() => todoTitles(page)).toEqual(['Третья', 'Первая']);
  await expect(page.getByRole('listitem').nth(1)).toBeFocused();
  await expect(page.getByText('Задача удалена')).toBeVisible();

  await page.keyboard.press('Control+z');

  await expect.poll(() => todoTitles(page)).toEqual(['Третья', 'Вторая', 'Первая']);
});

test('Backspace deletes the last todo and moves the focus to the input', async ({ page }) => {
  await addTodosByKeyboard(page, 'Единственная');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Backspace');

  await expect(todoRows(page)).toHaveCount(0);
  await expect(newTodoInput(page)).toBeFocused();
});

test('Shift+Delete removes completed todos and Ctrl+Z brings them back', async ({ page }) => {
  await addTodosByKeyboard(page, 'А', 'Б', 'В');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');

  await page.keyboard.press('Shift+Delete');

  await expect.poll(() => todoTitles(page)).toEqual(['Б']);

  await page.keyboard.press('Control+z');

  await expect.poll(() => todoTitles(page)).toEqual(['В', 'Б', 'А']);
});

test('Ctrl+Z inside the input undoes typing and does not restore todos', async ({ page }) => {
  await addTodosByKeyboard(page, 'Задача');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Delete');
  await expect(todoRows(page)).toHaveCount(0);

  await newTodoInput(page).focus();
  await page.keyboard.type('Текст');
  await page.keyboard.press('Control+z');

  await expect(todoRows(page)).toHaveCount(0);
});

test('the clear completed button and the theme switcher are reachable by Tab', async ({ page }) => {
  await addTodosByKeyboard(page, 'Задача');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');

  const clearButton = page.getByRole('button', { name: 'Удалить завершённые' });

  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(clearButton).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(todoRows(page)).toHaveCount(0);
});

test('the question mark opens the shortcuts dialog and Escape closes it', async ({ page }) => {
  await page.keyboard.press('?');

  const dialog = page.getByRole('dialog', { name: 'Горячие клавиши' });

  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Редактировать на месте')).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog).toHaveCount(0);
});

test('the question mark typed in the input does not open the dialog', async ({ page }) => {
  await newTodoInput(page).focus();
  await page.keyboard.type('Как дела?');

  await expect(newTodoInput(page)).toHaveValue('Как дела?');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('announces the result of actions to screen readers', async ({ page }) => {
  const status = page.getByRole('status');

  await addTodosByKeyboard(page, 'Задача');
  await expect(status).toHaveText('Задача добавлена');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(status).toHaveText('Задача «Задача» выполнена');

  await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toBeFocused();
  await page.keyboard.type('Другая');
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('Задача изменена');
});

test('Shift+Delete on a completed row keeps the focus in the page', async ({ page }) => {
  await addTodosByKeyboard(page, 'Первая', 'Вторая');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');

  await page.keyboard.press('Shift+Delete');

  await expect.poll(() => todoTitles(page)).toEqual(['Первая']);
  await expect(page.getByRole('listitem').nth(0)).toBeFocused();

  await page.keyboard.press('Space');
  await page.keyboard.press('Shift+Delete');

  await expect(todoRows(page)).toHaveCount(0);
  await expect(newTodoInput(page)).toBeFocused();
});

test.describe('shortcut hints at the bottom of the page', () => {
  const hints = (page: Page) => page.getByRole('note', { name: 'Подсказка по горячим клавишам' });

  test('follow the focus: input, row and in-place editor', async ({ page }) => {
    await newTodoInput(page).focus();

    await expect(hints(page)).toContainText('Enter');
    await expect(hints(page)).toContainText('добавить');
    // Пока список пуст, перехода к нему нет.
    await expect(hints(page)).not.toContainText('к списку');

    await addTodosByKeyboard(page, 'Задача');

    await expect(hints(page)).toContainText('↓');
    await expect(hints(page)).toContainText('к списку');
    // В поле ввода «?», Ctrl+Z и Shift+Delete принадлежат полю, поэтому их нет в подсказке.
    await expect(hints(page)).not.toContainText('все клавиши');

    await page.keyboard.press('ArrowDown');

    await expect(hints(page)).toContainText('Пробел');
    await expect(hints(page)).toContainText('отметить');
    await expect(hints(page)).toContainText('удалить');
    await expect(hints(page)).toContainText('все клавиши');
    await expect(hints(page)).not.toContainText('добавить');

    await page.keyboard.press('Enter');
    await expect(page.getByRole('textbox', { name: 'Название задачи' })).toBeFocused();

    await expect(hints(page)).toContainText('сохранить');
    await expect(hints(page)).toContainText('отменить');
    await expect(hints(page)).not.toContainText('Пробел');
  });

  test('show only the shortcuts that currently work', async ({ page }) => {
    await addTodosByKeyboard(page, 'Задача');
    await page.keyboard.press('ArrowDown');

    await expect(hints(page)).not.toContainText('Shift+Delete');
    await expect(hints(page)).not.toContainText('Ctrl+Z');

    await page.keyboard.press('Space');
    await expect(hints(page)).toContainText('Shift+Delete');
    await expect(hints(page)).toContainText('удалить завершённые');

    await page.keyboard.press('Delete');
    await expect(todoRows(page)).toHaveCount(0);
    // Фокус ушёл со страницы в пустое место: подсказки общие, без привязки к полю или строке.
    await page.mouse.click(5, 5);

    await expect(hints(page)).toContainText('Ctrl+Z');
    await expect(hints(page)).toContainText('вернуть удалённое');
    await expect(hints(page)).not.toContainText('Shift+Delete');
  });

  test('do not cover the last todo when the page is scrolled to the end', async ({ page }) => {
    await addTodosByKeyboard(
      page,
      'Раз',
      'Два',
      'Три',
      'Четыре',
      'Пять',
      'Шесть',
      'Семь',
      'Восемь',
    );
    await page.setViewportSize({ width: 900, height: 420 });
    await page.mouse.move(450, 200);
    await page.mouse.wheel(0, 3000);

    const last = await todoRow(page, 'Раз').boundingBox();
    const bar = await hints(page).boundingBox();

    expect((last?.y ?? 0) + (last?.height ?? 0)).toBeLessThanOrEqual(bar?.y ?? 0);
  });
});
