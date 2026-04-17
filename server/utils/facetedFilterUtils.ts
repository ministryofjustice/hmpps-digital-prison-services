export default function mergeFilterCounts<T extends { value: string; count: number }>(
  full: T[],
  constrained?: T[],
): T[] {
  const map = new Map((constrained || []).map(f => [f.value, f.count]))
  return full.map(f => ({ ...f, count: map.get(f.value) ?? 0 }))
}
