// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Resource } from './resource';

it('keeps an editing child mounted when a background refresh fails', async () => {
  const query = {
    isPending: false,
    isError: false,
    error: null,
    data: { content: 'server content' },
    refetch: async () => undefined,
  };
  const child = (data: { content: string }) => (
    <input aria-label="工作稿" defaultValue={data.content} />
  );
  const { rerender } = render(<Resource query={query}>{child}</Resource>);
  const input = screen.getByRole('textbox', { name: '工作稿' });
  await userEvent.clear(input);
  await userEvent.type(input, 'unsaved changes');
  rerender(
    <Resource query={{ ...query, isError: true, error: new Error('offline') }}>
      {child}
    </Resource>,
  );
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.getByRole('textbox', { name: '工作稿' })).toBe(input);
  expect(input).toHaveValue('unsaved changes');
});
