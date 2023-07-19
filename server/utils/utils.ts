import { CaseLoad } from '../data/interfaces/caseLoad'
import { HmppsError } from '../data/interfaces/hmppsError'
import { SelectItem } from '../data/interfaces/selectItem'

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
