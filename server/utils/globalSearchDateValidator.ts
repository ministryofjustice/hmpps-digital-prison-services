import { isBefore, isFuture, isValid, parse } from 'date-fns'
import { HmppsError } from '../data/interfaces/hmppsError'

export default function globalSearchDateValidator(dateOfBirth?: {
  day: string
  month: string
  year: string
}): HmppsError[] {
  const { day, month, year } = dateOfBirth

  const isRealDate = (date: string): boolean => {
    const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})[-/,. ](\d{4})/

    if (!dateFormatPattern.test(date)) return false
    const separator = date.match(dateFormatPattern)[2]
    return isValid(parse(date, `dd${separator}MM${separator}yyyy`, new Date()))
  }

  const errors: HmppsError[] = []
  const date = day && month && year ? `${day}/${month}/${year}` : null

  const missingFields = [day, month, year].filter(it => !it).length

  if (missingFields === 3) {
    return []
  }

  if (missingFields >= 1) {
    if (!day) errors.push({ text: 'Date of birth must include a day', href: '#dobDay' })
    else if (!month) errors.push({ text: 'Date of birth must include a month', href: '#dobMonth' })
    else if (!year) errors.push({ text: 'Date of birth must include a year', href: '#dobYear' })
    return errors
  }

  if (!isRealDate(date)) {
    errors.push(
      { text: 'Enter a date of birth which is a real date', href: '#dobDay' },
      { text: '', href: '#dobError' },
    )
  }

  if (isRealDate(date) && isFuture(date)) {
    errors.push({ text: `Date of birth must be in the past`, href: `#dobDay` }, { text: '', href: '#dobError' })
  }

  if (isRealDate(date) && isBefore(date, new Date(1900, 0, 1))) {
    errors.push({ text: `Date of birth must be after 1900`, href: `#dobDay` }, { text: '', href: '#dobError' })
  }

  return errors
}
