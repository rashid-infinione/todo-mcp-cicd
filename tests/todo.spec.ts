import { test, expect, Page } from '@playwright/test';

const URL = 'https://demo.playwright.dev/todomvc';

// ── Helper ────────────────────────────────────────────────────────────────────
async function addTodo(page: Page, text: string) {
  await page.locator('.new-todo').fill(text);
  await page.locator('.new-todo').press('Enter');
}

async function addTodos(page: Page, ...items: string[]) {
  for (const item of items) await addTodo(page, item);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe('Add todos', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL); });

  test('adds a single todo and clears the input', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toContainText('Buy groceries');
    await expect(page.locator('.new-todo')).toHaveValue('');
  });

  test('adds multiple todos in order', async ({ page }) => {
    await addTodos(page, 'First', 'Second', 'Third');
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').nth(0)).toContainText('First');
    await expect(page.locator('.todo-list li').nth(1)).toContainText('Second');
    await expect(page.locator('.todo-list li').nth(2)).toContainText('Third');
  });

  test('does not add todo on empty input', async ({ page }) => {
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('does not add todo for whitespace-only input', async ({ page }) => {
    await page.locator('.new-todo').fill('   ');
    await page.locator('.new-todo').press('Enter');
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });
});

test.describe('Complete and uncomplete todos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await addTodos(page, 'Task A', 'Task B', 'Task C');
  });

  test('marks a todo as completed', async ({ page }) => {
    await page.locator('.todo-list li').first().locator('.toggle').click();
    await expect(page.locator('.todo-list li').first()).toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });

  test('uncompletes a completed todo', async ({ page }) => {
    const item = page.locator('.todo-list li').first();
    await item.locator('.toggle').click();
    await item.locator('.toggle').click();
    await expect(item).not.toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });
});

test.describe('Delete todos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await addTodos(page, 'Delete me', 'Keep me');
  });

  test('deletes a todo via the destroy button', async ({ page }) => {
    const item = page.locator('.todo-list li').first();
    await item.hover();
    await item.locator('.destroy').click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toContainText('Keep me');
  });
});

test.describe('Edit todos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await addTodo(page, 'Original text');
  });

  test('edits a todo and saves on Enter', async ({ page }) => {
    await page.locator('.todo-list li label').dblclick();
    const editInput = page.locator('.todo-list li .edit');
    await editInput.fill('Updated text');
    await editInput.press('Enter');
    await expect(page.locator('.todo-list li label')).toContainText('Updated text');
  });

  test('cancels edit on Escape', async ({ page }) => {
    await page.locator('.todo-list li label').dblclick();
    const editInput = page.locator('.todo-list li .edit');
    await editInput.fill('Should not save');
    await editInput.press('Escape');
    await expect(page.locator('.todo-list li label')).toContainText('Original text');
  });
});

test.describe('Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await addTodos(page, 'Active 1', 'Active 2', 'Done');
    await page.locator('.todo-list li').nth(2).locator('.toggle').click();
  });

  test('Active filter shows only incomplete items', async ({ page }) => {
    await page.locator('a', { hasText: 'Active' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(2);
  });

  test('Completed filter shows only completed items', async ({ page }) => {
    await page.locator('a', { hasText: 'Completed' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toContainText('Done');
  });

  test('All filter shows every item', async ({ page }) => {
    await page.locator('a', { hasText: 'Active' }).click();
    await page.locator('a', { hasText: 'All' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(3);
  });
});

test.describe('Toggle all', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await addTodos(page, 'Task 1', 'Task 2', 'Task 3');
  });

  test('marks every item complete', async ({ page }) => {
    await page.locator('.toggle-all').click();
    for (let i = 0; i < 3; i++) {
      await expect(page.locator('.todo-list li').nth(i)).toHaveClass(/completed/);
    }
    await expect(page.locator('.todo-count')).toContainText('0 items left');
  });

  test('marks every item active on second click', async ({ page }) => {
    await page.locator('.toggle-all').click();
    await page.locator('.toggle-all').click();
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });
});

test.describe('Clear completed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await addTodos(page, 'Keep 1', 'Keep 2', 'Remove me');
    await page.locator('.todo-list li').nth(2).locator('.toggle').click();
  });

  test('clears completed items', async ({ page }) => {
    await page.locator('.clear-completed').click();
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.clear-completed')).toHaveCount(0);
  });
});

test.describe('Footer counter grammar', () => {
  test.beforeEach(async ({ page }) => { await page.goto(URL); });

  test('shows "1 item left" for one item', async ({ page }) => {
    await addTodo(page, 'Solo task');
    await expect(page.locator('.todo-count')).toContainText('1 item left');
  });

  test('shows "N items left" for multiple items', async ({ page }) => {
    await addTodos(page, 'Task 1', 'Task 2');
    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });
});

test.describe('Persistence', () => {
  test('todos persist after page reload', async ({ page }) => {
    await page.goto(URL);
    await addTodos(page, 'Persistent task', 'Another task');
    await page.locator('.todo-list li').first().locator('.toggle').click();
    await page.reload();
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').first()).toHaveClass(/completed/);
  });
});
