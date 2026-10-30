import { expect, test, type Page } from '@playwright/test';

const newTodoInput = (page: Page) => page.getByRole('textbox', { name: 'Новая задача' });

const addTodo = async (page: Page, title: string) => {
  const input = newTodoInput(page);

  await input.fill(title);
  await input.press('Enter');
  // Добавление применяется внутри View Transition, то есть чуть позже нажатия Enter.
  if (title.trim()) {
    await expect(page.getByRole('checkbox', { name: title, exact: true })).toBeVisible();
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('adds a todo and marks it as completed', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Изучить Playwright' });

  await addTodo(page, 'Изучить Playwright');

  await expect(newTodoInput(page)).toHaveValue('');
  await expect(checkbox).toBeVisible();
  await expect(checkbox).not.toBeChecked();

  await checkbox.check();

  await expect(checkbox).toBeChecked();
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toBeVisible();
});

test('puts new todos at the top of the list and keeps the input empty for the next one', async ({
  page,
}) => {
  await addTodo(page, 'Первая добавленная');
  await addTodo(page, 'Вторая добавленная');
  await addTodo(page, 'Третья добавленная');

  const checkboxes = page.getByRole('checkbox');

  await expect(checkboxes).toHaveCount(3);
  await expect(checkboxes.nth(0)).toHaveAccessibleName('Третья добавленная');
  await expect(checkboxes.nth(1)).toHaveAccessibleName('Вторая добавленная');
  await expect(checkboxes.nth(2)).toHaveAccessibleName('Первая добавленная');
  await expect(newTodoInput(page)).toBeFocused();
});

test('does not add a todo with a blank title', async ({ page }) => {
  await addTodo(page, '   ');

  await expect(page.getByRole('checkbox')).toHaveCount(0);
});

test('Escape clears the new todo input', async ({ page }) => {
  const input = newTodoInput(page);

  await input.fill('Черновик');
  await input.press('Escape');

  await expect(input).toHaveValue('');
});

test('edits a todo title in place', async ({ page }) => {
  await addTodo(page, 'Старое название');
  await page.getByRole('button', { name: 'Редактировать задачу' }).click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await expect(editInput).toHaveValue('Старое название');
  await expect(editInput).toBeFocused();
  // Поле создания остаётся отдельной строкой и не используется для правки.
  await expect(newTodoInput(page)).toHaveValue('');

  await editInput.fill('Новое название');
  await editInput.press('Enter');

  await expect(page.getByRole('checkbox', { name: 'Новое название' })).toBeVisible();
  await expect(page.getByText('Старое название', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toHaveCount(0);
});

test('cancels in-place editing with Escape without changing the todo', async ({ page }) => {
  await addTodo(page, 'Исходное название');
  await page.getByRole('button', { name: 'Редактировать задачу' }).click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await editInput.fill('Несохранённое название');
  await editInput.press('Escape');

  await expect(page.getByRole('checkbox', { name: 'Исходное название' })).toBeVisible();
  await expect(page.getByText('Несохранённое название', { exact: true })).toHaveCount(0);
});

test('does not save a blank title while editing and keeps the previous one', async ({ page }) => {
  await addTodo(page, 'Остаётся');
  await page.getByRole('button', { name: 'Редактировать задачу' }).click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await editInput.fill('   ');
  await editInput.press('Enter');

  await expect(page.getByRole('checkbox', { name: 'Остаётся' })).toBeVisible();
});

test('saves the edited title when the focus leaves the row', async ({ page }) => {
  await addTodo(page, 'Было');
  await page.getByRole('button', { name: 'Редактировать задачу' }).click();
  await page.getByRole('textbox', { name: 'Название задачи' }).fill('Стало');

  await newTodoInput(page).click();

  await expect(page.getByRole('checkbox', { name: 'Стало' })).toBeVisible();
});

test('edits a todo by a double click on its row', async ({ page }) => {
  await addTodo(page, 'Двойной клик');
  await page.getByText('Двойной клик', { exact: true }).dblclick();

  await expect(page.getByRole('textbox', { name: 'Название задачи' })).toHaveValue('Двойной клик');
});

test('removes only completed todos and offers to undo', async ({ page }) => {
  await addTodo(page, 'Активная задача');
  await addTodo(page, 'Завершённая задача');
  await page.getByRole('checkbox', { name: 'Завершённая задача' }).check();

  await page.getByRole('button', { name: 'Удалить завершённые' }).click();

  await expect(page.getByRole('checkbox', { name: 'Активная задача' })).toBeVisible();
  await expect(page.getByText('Завершённая задача', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toHaveCount(0);
  await expect(page.getByText('Удалено задач: 1')).toBeVisible();

  await page.getByRole('button', { name: 'Отменить' }).click();

  await expect(page.getByRole('checkbox', { name: 'Завершённая задача' })).toBeChecked();
  await expect(page.getByRole('checkbox')).toHaveCount(2);
});

test('shows a trash button instead of the edit button for a completed todo and deletes it', async ({
  page,
}) => {
  await addTodo(page, 'Для удаления');
  await addTodo(page, 'Остаётся');

  const editButtons = page.getByRole('button', { name: 'Редактировать задачу' });
  const deleteButton = page.getByRole('button', { name: 'Удалить задачу' });

  await expect(editButtons).toHaveCount(2);
  await expect(deleteButton).toHaveCount(0);

  await page.getByRole('checkbox', { name: 'Для удаления' }).check();

  await expect(editButtons).toHaveCount(1);
  await expect(deleteButton).toHaveCount(1);

  await deleteButton.click();

  await expect(page.getByRole('checkbox', { name: 'Для удаления' })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Остаётся' })).toBeVisible();
  await expect(page.getByText('Задача удалена')).toBeVisible();
});

test('restores a deleted todo to its previous position with the undo button', async ({ page }) => {
  await addTodo(page, 'Третья');
  await addTodo(page, 'Вторая');
  await addTodo(page, 'Первая');
  await page.getByRole('checkbox', { name: 'Вторая' }).check();
  await page.getByRole('button', { name: 'Удалить задачу' }).click();

  await expect(page.getByRole('checkbox')).toHaveCount(2);

  await page.getByRole('button', { name: 'Отменить' }).click();

  const checkboxes = page.getByRole('checkbox');

  await expect(checkboxes).toHaveCount(3);
  await expect(checkboxes.nth(0)).toHaveAccessibleName('Первая');
  await expect(checkboxes.nth(1)).toHaveAccessibleName('Вторая');
  await expect(checkboxes.nth(2)).toHaveAccessibleName('Третья');
});

test('keeps todos and their status after a page reload', async ({ page }) => {
  await addTodo(page, 'Сохранённая задача');
  await addTodo(page, 'Выполненная задача');
  await page.getByRole('checkbox', { name: 'Выполненная задача' }).check();

  await page.reload();

  await expect(page.getByRole('checkbox', { name: 'Сохранённая задача' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Выполненная задача' })).toBeChecked();

  await page.getByRole('button', { name: 'Удалить задачу' }).click();
  // Удаление анимируется и применяется чуть позже клика: дожидаемся его перед перезагрузкой.
  await expect(page.getByRole('checkbox', { name: 'Выполненная задача' })).toHaveCount(0);
  await page.reload();

  await expect(page.getByRole('checkbox', { name: 'Выполненная задача' })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Сохранённая задача' })).toBeVisible();
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

  await expect(page.getByRole('checkbox', { name: 'Корректная задача' })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(1);
});

test('shows task action buttons only on hover or keyboard focus on a device with a mouse', async ({
  page,
}) => {
  await addTodo(page, 'Задача с действиями');
  await addTodo(page, 'Другая задача');

  const editButtons = page.getByRole('button', { name: 'Редактировать задачу' });
  const otherEdit = editButtons.nth(0);
  const firstEdit = editButtons.nth(1);

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
