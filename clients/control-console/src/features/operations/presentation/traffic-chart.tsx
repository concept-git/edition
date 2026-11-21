import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
export default function TrafficChart({
  series,
}: {
  series: { time?: string; pv?: number; uv?: number }[];
}) {
  return (
    <figure className="mt-4">
      <figcaption className="mb-2 text-sm">页面访问量</figcaption>
      <div className="h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tickFormatter={(value: string) => value.slice(0, 10)}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area
              dataKey="pv"
              name="访问量"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>流量数据</caption>
        <thead>
          <tr>
            <th>时间</th>
            <th>访问量</th>
            <th>访客数</th>
          </tr>
        </thead>
        <tbody>
          {series.map((row) => (
            <tr key={row.time}>
              <td>{row.time}</td>
              <td>{row.pv}</td>
              <td>{row.uv}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
