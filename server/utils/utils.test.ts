import {
  addDefaultSelectedValue,
  asSelectItem,
  convertToTitleCase,
  findError,
  initialiseName,
  prisonerBelongsToUsersCaseLoad,
  userHasAllRoles,
  userHasRoles,
} from './utils'
import { HmppsError } from '../data/interfaces/hmppsError'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { Role } from '../enums/role'
import { SelectItem } from '../data/interfaces/selectItem'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('findError', () => {
  it('should return an error from a list of errors', () => {
    const errors: HmppsError[] = [
      { text: 'My error', href: '#myError' },
      { text: 'Some other error', href: '#otherError' },
    ]
    const error = findError(errors, 'myError')
    expect(error.text).toEqual('My error')
  })

  it('should return null if error is not in a list of errors', () => {
    const errors: HmppsError[] = [
      { text: 'My error', href: '#myError' },
      { text: 'Some other error', href: '#otherError' },
    ]
    const error = findError(errors, 'nonExistentError')
    expect(error).toBeNull()
  })

  it('should return null if there are no errors', () => {
    const errors: HmppsError[] = null
    const error = findError(errors, 'myError')
    expect(error).toBeNull()
  })
})

describe('prisonerBelongsToUsersCaseLoad', () => {
  it('Should return true when the user has a caseload matching the prisoner', () => {
    const caseLoads: CaseLoad[] = [
      { caseloadFunction: '', caseLoadId: 'ABC', currentlyActive: false, description: '', type: '' },
      { caseloadFunction: '', caseLoadId: 'DEF', currentlyActive: false, description: '', type: '' },
    ]

    expect(prisonerBelongsToUsersCaseLoad('DEF', caseLoads)).toEqual(true)
  })

  it('Should return false when the user has a caseload that doesnt match the prisoner', () => {
    const caseLoads: CaseLoad[] = [
      { caseloadFunction: '', caseLoadId: 'ABC', currentlyActive: false, description: '', type: '' },
      { caseloadFunction: '', caseLoadId: 'DEF', currentlyActive: false, description: '', type: '' },
    ]

    expect(prisonerBelongsToUsersCaseLoad('123', caseLoads)).toEqual(false)
  })
})

describe('userHasRoles', () => {
  it.each([
    { roles: [Role.GlobalSearch], userRoles: [Role.GlobalSearch], result: true },
    { roles: [Role.GlobalSearch], userRoles: ['SOME_ROLE', Role.GlobalSearch], result: true },
    { roles: [Role.GlobalSearch], userRoles: [], result: false },
    { roles: [], userRoles: [Role.GlobalSearch], result: false },
    { roles: [Role.GlobalSearch, 'SOME_ROLE'], userRoles: ['SOME_ROLE'], result: true },
  ])('Should return the correct result when checking user roles', ({ roles, userRoles, result }) => {
    expect(userHasRoles(roles, userRoles)).toEqual(result)
  })
})

describe('userHasAllRoles', () => {
  it.each([
    { roles: [Role.GlobalSearch], userRoles: [Role.GlobalSearch], result: true },
    { roles: [Role.GlobalSearch], userRoles: ['SOME_ROLE', Role.GlobalSearch], result: true },
    {
      roles: [Role.GlobalSearch, Role.InactiveBookings],
      userRoles: [Role.InactiveBookings, Role.GlobalSearch],
      result: true,
    },
    { roles: [Role.GlobalSearch], userRoles: [], result: false },
    { roles: [Role.GlobalSearch, Role.InactiveBookings], userRoles: [Role.GlobalSearch], result: false },
    { roles: [Role.GlobalSearch, Role.InactiveBookings], userRoles: ['SOME_ROLE', Role.GlobalSearch], result: false },
  ])('Should return the correct result when checking user roles', ({ roles, userRoles, result }) => {
    expect(userHasAllRoles(roles, userRoles)).toEqual(result)
  })
})

describe('addDefaultSelectedValue', () => {
  it('should add default text and value', () => {
    const items: SelectItem[] = [
      { text: 'One', value: '1' },
      { text: 'Two', value: '2' },
    ]
    expect(addDefaultSelectedValue(items, 'Zero', '-1')).toEqual([
      { text: 'Zero', value: '-1', selected: true },
      ...items,
    ])
  })

  it('should add default text and empty value', () => {
    const items: SelectItem[] = [
      { text: 'One', value: '1' },
      { text: 'Two', value: '2' },
    ]
    expect(addDefaultSelectedValue(items, 'Zero')).toEqual([{ text: 'Zero', value: '', selected: true }, ...items])
  })

  it('should return null if list is falsy', () => {
    expect(addDefaultSelectedValue(undefined, 'Zero')).toBeNull()
  })
})

describe('asSelectItem', () => {
  let nonSelectItems: Record<string, string>[]
  const selectItems1: SelectItem[] = [
    { value: 'one', text: 'description one' },
    { value: 'two', text: 'description two' },
    { value: 'three', text: 'description three' },
  ]
  const selectItems2: SelectItem[] = [
    { value: 'one', text: 'one' },
    { value: 'two', text: 'two' },
    { value: 'three', text: 'three' },
  ]

  beforeEach(() => {
    nonSelectItems = [
      { code: 'one', description: 'description one' },
      { code: 'two', description: 'description two' },
      { code: 'three', description: 'description three' },
    ]
  })

  it('should return list of SelectItems with supplied text and value', () => {
    expect(asSelectItem(nonSelectItems, 'description', 'code')).toEqual(selectItems1)
  })

  it('should return list of SelectItems with supplied text only', () => {
    expect(asSelectItem(nonSelectItems, 'code')).toEqual(selectItems2)
  })
})
