// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServicesContext } from '@/shared/api/context';
import { SessionTransport } from '@/shared/api/session';
import { createApi } from '@/shared/api/generated/sdk';
import { Command } from './operation-form';

it('clears a one-time result when the explicit Close button dismisses the dialog', async () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <ServicesContext
        value={{
          api: createApi(async () => Response.json({})),
          session: new SessionTransport(),
          scope: {
            tenantId: 'tenant',
            spaceId: '',
            siteId: '',
            pageId: '',
            teamId: '',
            resourceId: '',
            panel: '',
          },
          actorKey: 'actor',
          navigate: () => undefined,
        }}
      >
        <Command
          label="签发秘密"
          submit={async () => ({ data: { secret: 'one-time-secret' } })}
        />
      </ServicesContext>
    </QueryClientProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: '签发秘密' }));
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: /^确认$/,
    }),
  );
  expect(await screen.findByText('one-time-secret')).toBeVisible();
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: /^关闭$/,
    }),
  );
  await userEvent.click(screen.getByRole('button', { name: '签发秘密' }));
  expect(screen.queryByText('one-time-secret')).not.toBeInTheDocument();
  expect(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: /^确认$/,
    }),
  ).toBeEnabled();
});
