import { DEMO_SELF_ID, type Circle, type CircleMessage } from '@oreva/core';
import { useMemo } from 'react';
import { useCircle, useCircles } from '@/data/hooks';
import { usePrototypeStore } from '@/prototype/PrototypeStore';

/** Demo Circles plus the ones created on this phone, with locally typed messages appended. */
export function useCircleList(): { circles: Circle[]; isLoading: boolean } {
  const { data, isLoading } = useCircles();
  const { state } = usePrototypeStore();
  const circles = useMemo(() => {
    const created: Circle[] = state.createdCircles.map((c) => ({
      id: c.id,
      name: c.name,
      description: '',
      members: [{ id: DEMO_SELF_ID, displayName: 'You', sharesActivity: true }],
      messages: [],
      challenge: null,
      isPlaceholder: true,
    }));
    return [...created, ...(data ?? [])].map((circle) =>
      withLocalMessages(circle, state.localMessages[circle.id] ?? []),
    );
  }, [data, state.createdCircles, state.localMessages]);
  return { circles, isLoading };
}

export function useCircleView(id: string): { circle: Circle | null; isLoading: boolean } {
  const query = useCircle(id);
  const { circles } = useCircleList();
  const circle = useMemo(() => circles.find((c) => c.id === id) ?? null, [circles, id]);
  return { circle, isLoading: query.isLoading };
}

function withLocalMessages(
  circle: Circle,
  local: { id: string; body: string; sentAt: string }[],
): Circle {
  if (local.length === 0) {
    return circle;
  }
  const extra: CircleMessage[] = local.map((m) => ({
    id: m.id,
    authorId: DEMO_SELF_ID,
    sentAt: m.sentAt,
    kind: 'text',
    body: m.body,
  }));
  return { ...circle, messages: [...circle.messages, ...extra] };
}
