import { expect, test, type Page } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Membership behavior against the local auth stub.
 * A full Control stack is not started. The stub speaks the member, invitation,
 * and team contracts. The browser seam against a real Control server stays out
 * of this run.
 */

test.beforeEach(async ({ page }) => {
  await resetStub();
  await resetMembership();
  await signIn(page);
});

test.afterEach(async () => {
  await resetMembership();
});

test('an owner invites a member, places someone on a team, and cannot remove the last owner', async ({ page }) => {
  const main = canvas(page);
  await page.goto('/members');

  const members = main.getByRole('list', { name: '成员' });
  const owner = members.getByRole('listitem').filter({ hasText: '甲' });
  await expect(owner).toContainText('所有者');

  await main.getByLabel('邮箱').fill('newcomer@edition.test');
  await main.getByRole('button', { name: '邀请' }).click();

  const invites = main.getByRole('list', { name: '邀请' });
  const invite = invites.getByRole('listitem').filter({ hasText: 'newcomer@edition.test' });
  await expect(invite).toContainText('待接受');
  await expect(invite).toContainText('成员');
  const token = (await main.getByRole('status', { name: '邀请令牌' }).innerText()).trim();
  expect(token.length).toBeGreaterThan(10);
  await expect(invites).not.toContainText(token);

  await page.reload();
  await expect(canvas(page).getByRole('list', { name: '邀请' })).toContainText('待接受');
  await expect(page.getByText(token)).toHaveCount(0);

  await page.goto('/teams');
  await canvas(page).getByLabel('用户组名称').fill('编辑');
  await canvas(page).getByRole('button', { name: '创建用户组' }).click();
  const team = canvas(page).getByRole('listitem').filter({ hasText: '编辑' });
  const teamMembers = team.getByRole('list', { name: '用户组成员' });
  await expect(teamMembers).toContainText('维护者');
  await expect(teamMembers).toContainText('所有者');
  await team.getByLabel('成员邮箱').fill('colleague@edition.test');
  await team.getByRole('button', { name: '放入' }).click();
  const placed = team.getByRole('list', { name: '用户组邀请' });
  await expect(placed).toContainText('colleague@edition.test');
  await expect(placed).toContainText('待接受');
  const teamToken = (await team.getByRole('status', { name: '邀请令牌' }).innerText()).trim();
  expect(teamToken.length).toBeGreaterThan(10);
  await expect(placed).not.toContainText(teamToken);

  await page.reload();
  await expect(canvas(page).getByRole('list', { name: '用户组邀请' })).toContainText('colleague@edition.test');
  await expect(page.getByText(teamToken)).toHaveCount(0);

  await page.goto('/members');
  const stillOwner = canvas(page).getByRole('list', { name: '成员' }).getByRole('listitem').filter({ hasText: '甲' });
  await stillOwner.getByRole('button', { name: '移除' }).click();
  await stillOwner.getByRole('button', { name: '确认移除' }).click();
  await expect(canvas(page).getByRole('alert')).toHaveText('不能移除最后一位所有者。');
  await expect(stillOwner).toBeVisible();
  await expect(stillOwner).toContainText('所有者');
});

function canvas(page: Page) {
  return page.locator('[data-region="canvas"]');
}

async function resetMembership() {
  const response = await fetch('http://127.0.0.1:4188/__stub/membership/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`membership reset ${response.status}`);
}
