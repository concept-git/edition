import { useServices } from '@/shared/api/context';
import { ChoiceField } from '@/shared/ui/choice-field';
export function PagePicker({
  name = 'pageId',
  label = '页面',
}: {
  name?: string;
  label?: string;
}) {
  const { api, scope } = useServices();
  return (
    <ChoiceField
      name={name}
      label={label}
      kind={`pages:${scope.spaceId}`}
      searchable
      disabled={!scope.spaceId}
      load={async (signal, cursor, search) => {
        const { data } = await api.listPages({
          signal,
          params: {
            path: { tenantId: scope.tenantId, spaceId: scope.spaceId },
            query: { limit: 20, cursor, q: search || undefined },
          },
        });
        return {
          items: (data.items ?? []).map((page) => ({
            value: page.id ?? '',
            label: `${page.title} · ${page.slug}`,
          })),
          nextCursor: data.nextCursor,
        };
      }}
    />
  );
}
