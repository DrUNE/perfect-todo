import { expect, test, type Page } from '@playwright/test';

const addTodo = async (page: Page, title: string) => {
  const input = page.getByRole('textbox', { name: 'Название задачи' });

  await input.fill(title);
  await input.press('Enter');
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('adds a todo and marks it as completed', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Название задачи' });
  const checkbox = page.getByRole('checkbox', {
    name: 'Изучить Playwright',
  });

  await addTodo(page, 'Изучить Playwright');

  await expect(input).toHaveValue('');
  await expect(checkbox).toBeVisible();
  await expect(checkbox).not.toBeChecked();

  await checkbox.check();

  await expect(checkbox).toBeChecked();
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toBeVisible();
});

test('edits a todo title', async ({ page }) => {
  await addTodo(page, 'Старое название');

  const editButton = page.getByRole('button', {
    name: 'Редактировать задачу',
  });

  await editButton.click();

  const editInput = page.getByRole('textbox', { name: 'Название задачи' });

  await expect(editInput).toHaveValue('Старое название');
  await expect(page.getByRole('textbox')).toHaveCount(1);
  await editInput.fill('Новое название');
  await editInput.press('Enter');

  await expect(page.getByRole('checkbox', { name: 'Новое название' })).toBeVisible();
  await expect(page.getByText('Старое название', { exact: true })).toHaveCount(0);
});

test('cancels editing with Escape without changing the todo', async ({ page }) => {
  await addTodo(page, 'Исходное название');
  await page.getByRole('button', { name: 'Редактировать задачу' }).click();

  const input = page.getByRole('textbox', { name: 'Название задачи' });

  await input.fill('Несохранённое название');
  await input.press('Escape');

  await expect(input).toHaveValue('');
  await expect(page.getByRole('checkbox', { name: 'Исходное название' })).toBeVisible();
  await expect(page.getByText('Несохранённое название', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Отмена' })).toHaveCount(0);
});

test('removes only completed todos', async ({ page }) => {
  await addTodo(page, 'Активная задача');
  await addTodo(page, 'Завершённая задача');
  await page.getByRole('checkbox', { name: 'Завершённая задача' }).check();

  await page.getByRole('button', { name: 'Удалить завершённые' }).click();

  await expect(page.getByRole('checkbox', { name: 'Активная задача' })).toBeVisible();
  await expect(page.getByText('Завершённая задача', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Удалить завершённые' })).toHaveCount(0);
});

test('does not add a todo with a blank title', async ({ page }) => {
  await addTodo(page, '   ');

  await expect(page.getByRole('button', { name: 'Редактировать задачу' })).toHaveCount(0);
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
  await expect(deleteButton).toHaveCount(0);
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

test('puts new todos at the top of the list', async ({ page }) => {
  await addTodo(page, 'Первая добавленная');
  await addTodo(page, 'Вторая добавленная');
  await addTodo(page, 'Третья добавленная');

  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await expect(page.getByRole('checkbox').nth(0)).toHaveAccessibleName('Третья добавленная');
  await expect(page.getByRole('checkbox').nth(1)).toHaveAccessibleName('Вторая добавленная');
  await expect(page.getByRole('checkbox').nth(2)).toHaveAccessibleName('Первая добавленная');
});

test('shows task action buttons only on hover or focus on a device with a mouse', async ({
  page,
}) => {
  await addTodo(page, 'Задача с действиями');
  await addTodo(page, 'Другая задача');

  const editButtons = page.getByRole('button', { name: 'Редактировать задачу' });
  const firstEdit = editButtons.nth(1);
  const otherEdit = editButtons.nth(0);

  await page.mouse.move(0, 0);
  await expect(firstEdit).toHaveCSS('opacity', '0');
  await expect(otherEdit).toHaveCSS('opacity', '0');

  await page.getByText('Задача с действиями', { exact: true }).hover();
  await expect(firstEdit).toHaveCSS('opacity', '1');
  await expect(otherEdit).toHaveCSS('opacity', '0');

  await page.mouse.move(0, 0);
  await expect(firstEdit).toHaveCSS('opacity', '0');

  // После нажатия клавиши фокус считается клавиатурным (:focus-visible).
  await page.keyboard.press('Tab');
  await firstEdit.focus();
  await expect(firstEdit).toBeFocused();
  await expect(firstEdit).toHaveCSS('opacity', '1');
});

test('shows the delete button of a completed todo only on hover with a mouse', async ({ page }) => {
  await addTodo(page, 'Готовая задача');
  await page.getByRole('checkbox', { name: 'Готовая задача' }).check();
  await page.mouse.move(0, 0);

  const deleteButton = page.getByRole('button', { name: 'Удалить задачу' });

  await expect(deleteButton).toHaveCSS('opacity', '0');
  await page.getByText('Готовая задача', { exact: true }).hover();
  await expect(deleteButton).toHaveCSS('opacity', '1');
});
