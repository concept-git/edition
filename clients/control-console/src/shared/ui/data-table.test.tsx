// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './data-table';

it('keeps row controls mounted when refreshed data recreates column render functions', async () => {
  const table = (name: string) => (
    <DataTable
      rows={[{ id: 'stable-id', name }]}
      rowId={(row) => row.id}
      columns={[
        {
          id: 'name',
          title: '名称',
          render: (row) => (
            <input aria-label="编辑行" defaultValue={row.name} />
          ),
        },
      ]}
    />
  );
  const { rerender } = render(table('server value'));
  const input = screen.getByLabelText('编辑行');
  await userEvent.clear(input);
  await userEvent.type(input, 'unsaved row');
  rerender(table('refreshed value'));
  expect(screen.getByLabelText('编辑行')).toBe(input);
  expect(input).toHaveValue('unsaved row');
});
