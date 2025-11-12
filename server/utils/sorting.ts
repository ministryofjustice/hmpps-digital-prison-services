import { Request } from 'express'

import { mapToQueryString } from './utils'

const toggleSortDirection = (input: unknown) => {
  return input && input === 'ASC' ? 'DESC' : 'ASC'
}

export const sortParamToDirection = (param: string) => {
  switch (param) {
    case 'ASC':
      return 'ascending'
    case 'DESC':
      return 'descending'
    default:
      return 'none'
  }
}

export const nextSortQuery = (req: Request, key: string) => {
  return mapToQueryString({ [key]: toggleSortDirection(req.query[key]) })
}
