import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { UserSummary } from '@/utils/effectiveAccess';
import type { WorkspaceUser } from '@/api/types/admin';
import { CHART_TOOLTIP_STYLE, CHART_COLORS } from '@/utils/constants';

const TOP_N = 10;
const WS_COLOR = CHART_COLORS[0];  // indigo
const USER_COLOR = CHART_COLORS[1]; // amber

interface Props {
  workspaceUsers: Record<string, WorkspaceUser[]>;
  userSummaries: UserSummary[];
}

interface Bar {
  name: string;
  fullName: string;
  count: number;
}

function truncate(s: string, max = 20): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function ConcentrationChart({
  data,
  color,
  tooltipLabel,
}: {
  data: Bar[];
  color: string;
  tooltipLabel: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-[var(--m-text-tertiary)]">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(value, _name, props: { payload?: Bar }) => [
            typeof value === 'number' ? value : 0,
            props.payload?.fullName ?? tooltipLabel,
          ]}
          labelFormatter={() => ''}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} fillOpacity={1 - i * 0.06} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AccessConcentrationChart({ workspaceUsers, userSummaries }: Props) {
  const topWorkspaces = useMemo((): Bar[] => {
    return Object.entries(workspaceUsers)
      .map(([, users]) => {
        const name = users[0]
          ? (Object.values(workspaceUsers).length > 0
              ? users[0].userDetails.userPrincipalName // fallback
              : '')
          : '';
        // Get workspace name from first assignment's workspaceName via userSummaries
        const wsId = Object.keys(workspaceUsers).find(
          (id) => workspaceUsers[id] === users,
        ) ?? '';
        const wsName =
          userSummaries
            .flatMap((u) => u.assignments)
            .find((a) => a.workspaceId === wsId)?.workspaceName ?? wsId;
        void name;
        return { fullName: wsName, count: users.length };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_N)
      .map((d) => ({ ...d, name: truncate(d.fullName) }));
  }, [workspaceUsers, userSummaries]);

  const topUsers = useMemo((): Bar[] => {
    return userSummaries
      .filter((u) => u.principalType === 'User')
      .slice()
      .sort((a, b) => b.assignments.length - a.assignments.length)
      .slice(0, TOP_N)
      .map((u) => ({
        name: truncate(u.displayName),
        fullName: u.displayName,
        count: u.assignments.length,
      }));
  }, [userSummaries]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Most-assigned workspaces */}
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
        <div className="mb-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Most Assigned Workspaces
          </h2>
          <p className="mt-0.5 text-[11px] text-[var(--m-text-tertiary)]">
            Top {TOP_N} by principal count — over-sharing risk
          </p>
        </div>
        <ConcentrationChart
          data={topWorkspaces}
          color={WS_COLOR}
          tooltipLabel="principals"
        />
      </div>

      {/* Broadest user access */}
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
        <div className="mb-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Broadest User Access
          </h2>
          <p className="mt-0.5 text-[11px] text-[var(--m-text-tertiary)]">
            Top {TOP_N} users by workspace count — blast radius
          </p>
        </div>
        <ConcentrationChart
          data={topUsers}
          color={USER_COLOR}
          tooltipLabel="workspaces"
        />
      </div>
    </div>
  );
}
