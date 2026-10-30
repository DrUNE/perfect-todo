import { expect, test } from '@playwright/test';
import { addTodo, doneSuffix, markDone, newTodoInput, todoRow, todoRows } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('adds a todo and marks it as completed', async ({ page }) => {
  const checkbox = todoRow(page, 'Изучить Playwright');

  await addTodo(page, 'Изучить Playwright');

  await expect(newTodoInput(page)).toHaveValue('');
  await expect(checkbox).toBeVisible();
  await expect(checkbox).not.toHaveAccessibleName(doneSuffix);

  await markDone(page, 'Изучить Playwright');

  await expect(checkbox).toHaveAccessibleName(doneSuffix);
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toBeVisible();
});

test('puts new todos at the top of the list and keeps the input empty for the next one', async ({
  page,
}) => {
  await addTodo(page, 'Первая добавленная');
  await addTodo(page, 'Вторая добавленная');
  await addTodo(page, 'Третья добавленная');

  const checkboxes = todoRows(page);

  await expect(checkboxes).toHaveCount(3);
  await expect(checkboxes.nth(0)).toHaveAccessibleName('Третья добавленная');
  await expect(checkboxes.nth(1)).toHaveAccessibleName('Вторая добавленная');
  await expect(checkboxes.nth(2)).toHaveAccessibleName('Первая добавленная');
  await expect(newTodoInput(page)).toBeFocused();
});

test('does not add a todo with a blank title', async ({ page }) => {
  await addTodo(page, '   ');

  await expect(todoRows(page)).toHaveCount(0);
});

test('Escape clears the new todo input', async ({ page }) => {
  const input = newTodoInput(page);

  await input.fill('Черновик');
  await input.press('Escape');

  await expect(input).toHaveValue('');
});

test('edits a todo title in place', async ({ page }) => {
  await addTodo(page, 'Старое название');
  await todoRow(page, 'Старое название').click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await expect(editInput).toHaveValue('Старое название');
  await expect(editInput).toBeFocused();
  // Поле создания остаётся отдельной строкой и не используется для правки.
  await expect(newTodoInput(page)).toHaveValue('');

  await editInput.fill('Новое название');
  await editInput.press('Enter');

  await expect(todoRow(page, 'Новое название')).toBeVisible();
  await expect(page.getByText('Старое название', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toHaveCount(0);
});

test('cancels in-place editing with Escape without changing the todo', async ({ page }) => {
  await addTodo(page, 'Исходное название');
  await todoRow(page, 'Исходное название').click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await editInput.fill('Несохранённое название');
  await editInput.press('Escape');

  await expect(todoRow(page, 'Исходное название')).toBeVisible();
  await expect(page.getByText('Несохранённое название', { exact: true })).toHaveCount(0);
});

test('does not save a blank title while editing and keeps the previous one', async ({ page }) => {
  await addTodo(page, 'Остаётся');
  await todoRow(page, 'Остаётся').click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await editInput.fill('   ');
  await editInput.press('Enter');

  await expect(todoRow(page, 'Остаётся')).toBeVisible();
});

test('saves the edited title when the focus leaves the row', async ({ page }) => {
  await addTodo(page, 'Было');
  await todoRow(page, 'Было').click();
  await page.getByRole('textbox', { name: 'Название задачи' }).fill('Стало');

  await newTodoInput(page).click();

  await expect(todoRow(page, 'Стало')).toBeVisible();
});

test('edits a todo by a click on its row, but not by a click on its buttons', async ({ page }) => {
  await addTodo(page, 'Клик');
  await todoRow(page, 'Клик').getByText('Клик', { exact: true }).click();

  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toHaveValue('Клик');
  await page.getByRole('textbox', { name: 'Название задачи' }).press('Escape');

  await markDone(page, 'Клик');

  await expect(todoRow(page, 'Клик')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toHaveCount(0);
});

test('removes only completed todos and offers to undo', async ({ page }) => {
  await addTodo(page, 'Активная задача');
  await addTodo(page, 'Завершённая задача');
  await markDone(page, 'Завершённая задача');

  await page.getByRole('button', { name: 'Удалить завершённые' }).click();

  await expect(todoRow(page, 'Активная задача')).toBeVisible();
  await expect(page.getByText('Завершённая задача', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toHaveCount(0);
  await expect(page.getByText('Удалено задач: 1')).toBeVisible();

  await page.getByRole('button', { name: 'Отменить' }).click();

  await expect(todoRow(page, 'Завершённая задача')).toHaveAccessibleName(doneSuffix);
  await expect(todoRows(page)).toHaveCount(2);
});

test('shows a status button, and a trash button for a completed todo, which deletes it', async ({
  page,
}) => {
  await addTodo(page, 'Для удаления');
  await addTodo(page, 'Остаётся');

  const doneButtons = page.getByRole('button', { name: 'Отметить как сделанное' });
  const deleteButton = page.getByRole('button', { name: 'Удалить задачу' });

  await expect(doneButtons).toHaveCount(2);
  await expect(deleteButton).toHaveCount(0);

  await markDone(page, 'Для удаления');

  await expect(doneButtons).toHaveCount(1);
  await expect(deleteButton).toHaveCount(1);

  await deleteButton.click();

  await expect(todoRow(page, 'Для удаления')).toHaveCount(0);
  await expect(todoRow(page, 'Остаётся')).toBeVisible();
  await expect(page.getByText('Задача удалена')).toBeVisible();
});

test('restores a deleted todo to its previous position with the undo button', async ({ page }) => {
  await addTodo(page, 'Третья');
  await addTodo(page, 'Вторая');
  await addTodo(page, 'Первая');
  await markDone(page, 'Вторая');
  await page.getByRole('button', { name: 'Удалить задачу' }).click();

  await expect(todoRows(page)).toHaveCount(2);

  await page.getByRole('button', { name: 'Отменить' }).click();

  const checkboxes = todoRows(page);

  await expect(checkboxes).toHaveCount(3);
  await expect(checkboxes.nth(0)).toHaveAccessibleName('Первая');
  await expect(checkboxes.nth(1)).toHaveAccessibleName('Вторая, выполнено');
  await expect(checkboxes.nth(2)).toHaveAccessibleName('Третья');
});

test('keeps todos and their status after a page reload', async ({ page }) => {
  await addTodo(page, 'Сохранённая задача');
  await addTodo(page, 'Выполненная задача');
  await markDone(page, 'Выполненная задача');

  await page.reload();

  await expect(todoRow(page, 'Сохранённая задача')).not.toHaveAccessibleName(doneSuffix);
  await expect(todoRow(page, 'Выполненная задача')).toHaveAccessibleName(doneSuffix);

  await page.getByRole('button', { name: 'Удалить задачу' }).click();
  // Удаление анимируется и применяется чуть позже клика: дожидаемся его перед перезагрузкой.
  await expect(todoRow(page, 'Выполненная задача')).toHaveCount(0);
  await page.reload();

  await expect(todoRow(page, 'Выполненная задача')).toHaveCount(0);
  await expect(todoRow(page, 'Сохранённая задача')).toBeVisible();
});

test('ignores corrupted todos in localStorage', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      'todo-list',
      JSON.stringify({
        state: {
          todoList: [
            { id: 'ok', title: 'Корректная задача', isComplete: false },
            { id: 1, title: 'Неверный id', isComplete: false },
            { id: 'no-status', title: 'Без статуса' },
            null,
          ],
        },
        version: 0,
      }),
    );
  });
  await page.reload();

  await expect(todoRow(page, 'Корректная задача')).toBeVisible();
  await expect(todoRows(page)).toHaveCount(1);
});

test('shows task action buttons only on hover or keyboard focus on a device with a mouse', async ({
  page,
}) => {
  await addTodo(page, 'Задача с действиями');
  await addTodo(page, 'Другая задача');

  const doneButtons = page.getByRole('button', { name: 'Отметить как сделанное' });
  const otherEdit = doneButtons.nth(0);
  const firstEdit = doneButtons.nth(1);

  await page.mouse.move(0, 0);
  await expect(firstEdit).toHaveCSS('opacity', '0');
  await expect(otherEdit).toHaveCSS('opacity', '0');

  await page.getByText('Задача с действиями', { exact: true }).hover();
  await expect(firstEdit).toHaveCSS('opacity', '1');
  await expect(otherEdit).toHaveCSS('opacity', '0');

  await page.mouse.move(0, 0);
  await expect(firstEdit).toHaveCSS('opacity', '0');

  // Клавиатурный фокус на строке тоже показывает её кнопки.
  await newTodoInput(page).focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(firstEdit).toHaveCSS('opacity', '1');
  await expect(otherEdit).toHaveCSS('opacity', '0');
});

test('has no checkboxes: the status is changed with the button on the row', async ({ page }) => {
  await addTodo(page, 'Без чекбокса');

  const row = todoRow(page, 'Без чекбокса');

  await expect(page.getByRole('checkbox')).toHaveCount(0);

  await row.hover();
  await expect(row.getByRole('button', { name: 'Отметить как сделанное' })).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(row.getByRole('button', { name: 'Редактировать задачу' })).toHaveCount(0);

  await markDone(page, 'Без чекбокса');

  await expect(row).toHaveAccessibleName('Без чекбокса, выполнено');
  await expect(row.getByRole('button', { name: 'Отметить как сделанное' })).toHaveCount(0);

  await row.hover();
  await expect(row.getByRole('button', { name: 'Вернуть в работу' })).toHaveCSS('opacity', '1');
  await expect(row.getByRole('button', { name: 'Удалить задачу' })).toHaveCSS('opacity', '1');

  await row.getByRole('button', { name: 'Вернуть в работу' }).click();

  await expect(row).toHaveAccessibleName('Без чекбокса');
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toHaveCount(0);
});

test('dragging a row with the mouse does not change its status', async ({ page }) => {
  await addTodo(page, 'Не тянуть');
  await page.waitForFunction('document.getAnimations().length === 0');

  const box = await todoRow(page, 'Не тянуть').boundingBox();
  const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;
  const x = (box?.x ?? 0) + 40;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 140, y, { steps: 8 });
  await page.mouse.up();

  await expect(todoRow(page, 'Не тянуть')).toHaveAccessibleName('Не тянуть');
});

test('shows a text cursor over a row and a pointer over its buttons', async ({ page }) => {
  await addTodo(page, 'Курсор');

  const row = todoRow(page, 'Курсор');

  await expect(row).toHaveCSS('cursor', 'text');
  await expect(row.getByRole('button', { name: 'Отметить как сделанное' })).toHaveCSS(
    'cursor',
    'pointer',
  );
});

test('the editor looks like the row itself: same size, no label and no focus frame', async ({
  page,
}) => {
  await addTodo(page, 'Тот же вид');

  const row = todoRow(page, 'Тот же вид');
  const rowBox = await row.boundingBox();
  const inputBox = await row.getByText('Тот же вид', { exact: true }).boundingBox();

  await row.click();

  const editor = page.locator('[data-todo-editor]');
  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await expect(editInput).toBeFocused();
  expect(await editor.boundingBox()).toMatchObject({ y: rowBox?.y, height: rowBox?.height });
  // Текст остаётся на том же месте, виден только курсор: название поля не показывается, рамки фокуса нет.
  expect(
    Math.abs(((await editInput.boundingBox())?.x ?? 0) - (inputBox?.x ?? 0)),
  ).toBeLessThanOrEqual(2);
  await expect(editor.locator('.title')).not.toBeInViewport();
  await expect(editor).toHaveCSS('outline-style', 'none');
  expect(
    await editInput.evaluate((input) => ('selectionStart' in input ? input.selectionStart : null)),
  ).toBe('Тот же вид'.length);
});

test('a completed todo is shown in italics with a less contrasting text', async ({ page }) => {
  await addTodo(page, 'Сделано');

  const title = todoRow(page, 'Сделано').getByText('Сделано', { exact: true });

  await expect(title).toHaveCSS('font-style', 'normal');

  const activeColor = await title.evaluate(
    (element) => element.ownerDocument.defaultView?.getComputedStyle(element).color,
  );

  await markDone(page, 'Сделано');

  await expect(title).toHaveCSS('font-style', 'italic');
  // Зачёркивание остаётся: статус не должен передаваться только курсивом и цветом.
  await expect(title).toHaveCSS('text-decoration-line', 'line-through');
  await expect(title).not.toHaveCSS('color', activeColor);
});

test('the new todo row looks like a list row: same height, no floating label, no edit icon', async ({
  page,
}) => {
  await addTodo(page, 'В списке');

  const input = newTodoInput(page);
  const newRow = page.locator('.gtk-row.entry').first();
  const listRowBox = await todoRow(page, 'В списке').boundingBox();
  const label = newRow.locator('.title');

  expect((await newRow.boundingBox())?.height).toBe(listRowBox?.height);
  await expect(newRow.locator('.edit-icon')).toBeHidden();

  // Название стоит на месте текста и при фокусе не всплывает мелким заголовком.
  const labelBefore = await label.boundingBox();

  await input.focus();
  expect(await label.boundingBox()).toEqual(labelBefore);
  expect(
    await label.evaluate((el) => el.ownerDocument.defaultView?.getComputedStyle(el).fontSize),
  ).toBe(
    await todoRow(page, 'В списке')
      .getByText('В списке', { exact: true })
      .evaluate((el) => el.ownerDocument.defaultView?.getComputedStyle(el).fontSize),
  );

  // При вводе название пропадает, остаётся только текст.
  await input.fill('Печатаю');
  await expect(label).toHaveCSS('opacity', '0');
});
