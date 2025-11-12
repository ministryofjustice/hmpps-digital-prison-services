import { differenceInMonths, parse } from 'date-fns'
import path from 'path'
import fs from 'fs'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { HmppsError } from '../data/interfaces/hmppsError'
import { SelectItem } from '../data/interfaces/selectItem'
import logger from '../../logger'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Whether or not the prisoner belongs to any of the users case loads
 *
 * @param prisonerAgencyId
 * @param userCaseLoads
 */
export const prisonerBelongsToUsersCaseLoad = (prisonerAgencyId: string, userCaseLoads: CaseLoad[]): boolean => {
  return userCaseLoads.some(caseLoad => caseLoad.caseLoadId === prisonerAgencyId)
}

/**
 * Whether any of the roles exist for the given user allowing for conditional role based access on any number of roles
 *
 * @param rolesToCheck
 * @param userRoles
 */
export const userHasRoles = (rolesToCheck: string[], userRoles: string[]): boolean => {
  return rolesToCheck.some(role => userRoles.includes(role))
}

/**
 * Whether all of the roles exist for the given user allowing for conditional role based access on any number of roles
 *
 * @param rolesToCheck
 * @param userRoles
 */
export const userHasAllRoles = (rolesToCheck: string[], userRoles: string[]): boolean => {
  return rolesToCheck.every(role => userRoles.includes(role))
}

/**
 * Find error related to given form field and return error message
 *
 * Allows `govukInput` (etc) form input components to render an error message on the form field by using the `errorMessage` param,
 *
 * e.g. `errorMessage: errors | findError('from')`
 *
 * @param errors
 * @param formFieldId
 */
export const findError = (errors: HmppsError[], formFieldId: string) => {
  if (!errors) return null
  const item = errors.find((error: HmppsError) => error.href === `#${formFieldId}`)
  if (item) {
    return {
      text: item.text,
    }
  }
  return null
}

export const addDefaultSelectedValue = (items: SelectItem[], text: string, value?: string) => {
  if (!items) return null

  return [
    {
      text,
      value: value || '',
      selected: true,
    },
    ...items,
  ]
}

export const asSelectItem = (items: Record<string, string>[], text: string, value?: string) =>
  items && items.map(entry => ({ value: entry[value || text], text: entry[text] }))

/**
 * Format a person's name with proper capitalisation
 *
 * Correctly handles names with apostrophes, hyphens and spaces
 *
 * Examples, "James O'Reilly", "Jane Smith-Doe", "Robert Henry Jones"
 *
 * @param firstName - first name
 * @param middleNames - middle names as space separated list
 * @param lastName - last name
 * @param options
 * @param options.style - format to use for output name, e.g. `NameStyleFormat.lastCommaFirst`
 * @returns formatted name string
 */

export const formatName = (
  firstName: string,
  middleNames: string,
  lastName: string,
  options?: { style: 'firstMiddleLast' | 'lastCommaFirstMiddle' | 'lastCommaFirst' | 'firstLast' },
): string => {
  const names = [firstName, middleNames, lastName]
  if (options?.style === 'lastCommaFirstMiddle') {
    names.unshift(`${names.pop()},`)
  } else if (options?.style === 'lastCommaFirst') {
    names.unshift(`${names.pop()},`)
    names.pop() // Remove middleNames
  } else if (options?.style === 'firstLast') {
    names.splice(1, 1)
  }
  return names
    .filter(s => s)
    .map(s => s.trim().toLowerCase())
    .join(' ')
    .replace(/(^\w)|([\s'-]+\w)/g, letter => letter.toUpperCase())
}

export const assetMap = (url: string) => {
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    logger.error('Could not read asset manifest file')
  }

  return assetManifest[url] || url
}

export const formatLocation = (locationName: string): string => {
  if (!locationName) return undefined
  if (locationName.includes('RECP')) return 'Reception'
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  if (locationName.includes('COURT')) return 'Court'
  return locationName
}

export const calculateAge = (dob: string): { years: number; months: number } => {
  const currentDate = new Date()

  const birthDate = parse(dob, 'yyyy-MM-dd', new Date())

  const totalMonths = differenceInMonths(currentDate, birthDate)

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  return { years, months }
}

export type QueryParamValue = string | number | boolean

export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>

export const arrayToQueryString = (array: QueryParamValue[], key: string): string =>
  array && array.map(item => `${key}=${encodeURIComponent(item)}`).join('&')

export const mapToQueryString = (params: QueryParams): string => {
  if (!params) return ''
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
    .join('&')
}
