const filterForm = document.querySelector<HTMLFormElement>('[data-dynamic-filters]')
let abortController: AbortController | null = null

if (filterForm) {
  const endpoint = filterForm.dataset.dynamicFilters!
  const fieldMapping: Record<string, string> = JSON.parse(filterForm.dataset.filterMapping || '{}')

  filterForm.addEventListener('change', async () => {
    const counts = filterForm.querySelectorAll('.filter-count')
    counts.forEach(c => {
      c.innerHTML = '<span class="dot dot-1">.</span><span class="dot dot-2">.</span><span class="dot dot-3">.</span>'
      c.classList.add('filter-count--loading')
    })

    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    const params = new URLSearchParams()
    filterForm.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').forEach(cb => {
      const name = cb.name.replace('[]', '')
      params.append(fieldMapping[name] || name, cb.value)
    })

    try {
      const res = await fetch(`${endpoint}?${params}`, {
        signal: abortController.signal,
      })
      const data = await res.json()

      counts.forEach(c => {
        const el = c as HTMLElement
        const group = el.dataset.filterGroup
        const value = el.dataset.filterValue
        const field = fieldMapping[group as string] || group
        const match = (data[field as keyof typeof data] as Array<{ value: string; count: number }>)?.find(
          f => f.value === value,
        )
        el.textContent = match?.count?.toString() ?? '0'
        el.classList.remove('filter-count--loading')
      })
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        return
      }
      counts.forEach(c => {
        ;(c as HTMLElement).textContent = '?'
        c.classList.remove('filter-count--loading')
      })
    }
  })
}
