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

  await page.getByText('Старое название', { exact: true }).hover();
  await expect(editButton).toHaveCSS('opacity', '1');
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
  await page.getByText('Исходное название', { exact: true }).hover();
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
