import mergeFilterCounts from './facetedFilterUtils'

describe('mergeFilterCounts', () => {
  it('replaces counts from constrained set, defaulting missing to zero', () => {
    const full = [
      { name: 'A', value: 'A', count: 10 },
      { name: 'B', value: 'B', count: 5 },
    ]
    expect(mergeFilterCounts(full, [{ name: 'A', value: 'A', count: 3 }])).toEqual([
      { name: 'A', value: 'A', count: 3 },
      { name: 'B', value: 'B', count: 0 },
    ])
  })

  it('returns empty array when full set is empty', () => {
    expect(mergeFilterCounts([], [{ value: 'A', count: 5 }])).toEqual([])
  })

  it('handles null or undefined constrained set', () => {
    const full = [{ name: 'A', value: 'A', count: 10 }]
    expect(mergeFilterCounts(full, null as unknown as undefined)).toEqual([{ name: 'A', value: 'A', count: 0 }])
    expect(mergeFilterCounts(full, undefined)).toEqual([{ name: 'A', value: 'A', count: 0 }])
  })
})
