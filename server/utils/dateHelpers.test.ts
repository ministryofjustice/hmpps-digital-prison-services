import { endOfToday, startOfToday, subDays } from 'date-fns'
import {
  formatDate,
  formatDateISO,
  formatDateTime,
  formatDateTimeISO,
  isRealDate,
  isWithinLast3Days,
  parseDate,
} from './dateHelpers'

describe('formatDateISO', () => {
  it('should return an ISO-8601 date string given a valid date', () => {
    const dateStr = formatDateISO(new Date(2023, 0, 1)) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01')
  })

  it('should return undefined given an invalid date', () => {
    const dateStr = formatDateISO(null)
    expect(dateStr).toBeUndefined()
  })
})

describe('formatDateTimeISO', () => {
  it('should return an ISO-8601 datetime string given a valid date', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 0, 1, 11, 12, 13)) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01T11:12:13Z')
  })

  it('should return an ISO-8601 datetime string with time set to 00:00:00 if startOfDay flag is true', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 0, 1, 11, 12, 13), { startOfDay: true }) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01T00:00:00Z')
  })

  it('should return an ISO-8601 datetime string with time set to 23:59:59 if endOfDay flag is true', () => {
    const dateStr = formatDateTimeISO(new Date(2023, 0, 1, 11, 12, 13), { endOfDay: true }) // 1 Jan 2023
    expect(dateStr).toEqual('2023-01-01T23:59:59Z')
  })

  it('should return undefined given an invalid date', () => {
    const dateStr = formatDateTimeISO(null)
    expect(dateStr).toBeUndefined()
  })
})

describe('parseDate', () => {
  it.each([
    ['1/1/2001', new Date(2001, 0, 1)],
    ['1/01/2001', new Date(2001, 0, 1)],
    ['01/01/2001', new Date(2001, 0, 1)],
    ['30/11/2001', new Date(2001, 10, 30)],
    ['30-11-2001', new Date(2001, 10, 30)],
    ['30.11.2001', new Date(2001, 10, 30)],
    ['30,11,2001', new Date(2001, 10, 30)],
    ['30 11 2001', new Date(2001, 10, 30)],
  ])('For input %s parse to Date object %s', (date: string, expected: Date) => {
    expect(parseDate(date)).toEqual(expected)
  })

  it.each([[null], [''], ['33/11/2001'], ['30/14/2001'], ['30/11/01'], ['Tuesday']])(
    'For input %s return Invalid Date (NaN)',
    (date: string) => {
      const val = parseDate(date)
      // eslint-disable-next-line no-restricted-globals
      expect(isNaN(val.getTime())).toBeTruthy()
    },
  )
})

describe('isRealDate', () => {
  it.each([
    ['1/1/2001'],
    ['1/01/2001'],
    ['01/01/2001'],
    ['30/11/2001'],
    ['30-11-2001'],
    ['30.11.2001'],
    ['30,11,2001'],
    ['30 11 2001'],
  ])('For input %s expect real date', (date: string) => {
    expect(isRealDate(date)).toBeTruthy()
  })

  it.each([[null], [''], ['33/11/2001'], ['30/14/2001'], ['30/11/01'], ['Tuesday']])(
    'For input %s expect not real date',
    (date: string) => {
      expect(isRealDate(date)).toBeFalsy()
    },
  )
})

describe('format date', () => {
  it.each([
    [null, null, undefined, ''],
    ['[default]', '2023-01-20', undefined, '20 January 2023'],
    ['long', '2023-01-20', 'long', '20 January 2023'],
    ['short', '2023-01-20', 'short', '20/01/2023'],
    ['full', '2023-01-20', 'full', 'Friday 20 January 2023'],
    ['medium', '2023-01-20', 'medium', '20 Jan 2023'],
  ])(
    '%s: formatDate(%s, %s)',
    (_: string, a: string, b: undefined | 'short' | 'full' | 'long' | 'medium', expected: string) => {
      expect(formatDate(a, b)).toEqual(expected)
    },
  )
})

describe('format datetime', () => {
  it.each([
    [null, null, undefined, ''],
    ['[default]', '2023-01-20T12:13:14', undefined, '20 January 2023 12:13'],
    [
      'long',
      '2023-01-20T12:13:14',
      { style: 'long', separator: 'at' } as Parameters<typeof formatDateTime>[1],
      '20 January 2023 at 12:13',
    ],
    ['short', '2023-01-20T12:13:14', { style: 'short' } as Parameters<typeof formatDateTime>[1], '20/01/2023 12:13'],
    [
      'full at',
      '2023-01-20T12:13:14',
      { style: 'full', separator: 'at' } as Parameters<typeof formatDateTime>[1],
      'Friday 20 January 2023 at 12:13',
    ],
    [
      'medium at',
      '2023-01-20T12:13:14',
      { style: 'medium', separator: 'at' } as Parameters<typeof formatDateTime>[1],
      '20 Jan 2023 at 12:13',
    ],
    [
      'short on time first',
      '2023-01-20T12:13:14',
      { style: 'short', separator: 'on', order: 'time-date' },
      '12:13 on 20/01/2023',
    ],
  ])(
    '%s: formatDateTime(%s, %s)',
    (_: string, a: string, b: Parameters<typeof formatDateTime>[1], expected: string) => {
      expect(formatDateTime(a, b)).toEqual(expected)
    },
  )
})

describe('isWithinLast3Days', () => {
  it.each([
    [Date.now(), true],
    [startOfToday(), true],
    [subDays(startOfToday(), 1), true],
    [subDays(startOfToday(), 2), true],
    [subDays(endOfToday(), 3), false],
  ])('isWithinLast3Days(%s) - %s', (date: Date, expected: boolean) => {
    expect(isWithinLast3Days(date)).toBe(expected)
  })
})
