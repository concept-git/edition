import { useServices } from '@/shared/api/context';
import { ChoiceField } from '@/shared/ui/choice-field';
export function SpacePicker({
  name = 'spaceId',
  label = '空间',
}: {
  name?: string;
  label?: string;
}) {
  const { api, scope } = useServices();
  return (
    <ChoiceField
      name={name}
      label={label}
      kind="spaces"
      load={async (signal, cursor) => {
        const { data } = await api.listSpaces({
          signal,
          params: {
            path: { tenantId: scope.tenantId },
            query: { limit: 20, cursor },
          },
        });
        return {
          items: (data.items ?? []).map((space) => ({
            value: space.id ?? '',
            label: `${space.name} · ${space.mode === 'synced' ? '外部同步' : '站内创作'}`,
          })),
          nextCursor: data.nextCursor,
        };
      }}
    />
  );
}
