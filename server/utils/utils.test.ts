import {
  addDefaultSelectedValue,
  arrayToQueryString,
  asSelectItem,
  calculateAge,
  convertToTitleCase,
  findError,
  formatLocation,
  formatName,
  initialiseName,
  mapToQueryString,
  prisonerBelongsToUsersCaseLoad,
  shouldLinkProfile,
  shouldShowProfileImage,
  shouldShowUpdateLicenceLink,
  userHasAllRoles,
  userHasRoles,
} from './utils'
import { HmppsError } from '../data/interfaces/hmppsError'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { Role } from '../enums/role'
import { SelectItem } from '../data/interfaces/selectItem'
import { PrisonUser } from '../interfaces/prisonUser'
import Prisoner from '../data/interfaces/prisoner'

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
      roles: [Role.GlobalSearch, Role.DietAndAllergiesReport],
      userRoles: [Role.DietAndAllergiesReport, Role.GlobalSearch],
      result: true,
    },
    { roles: [Role.GlobalSearch], userRoles: [], result: false },
    { roles: [Role.GlobalSearch, Role.DietAndAllergiesReport], userRoles: [Role.GlobalSearch], result: false },
    {
      roles: [Role.GlobalSearch, Role.DietAndAllergiesReport],
      userRoles: ['SOME_ROLE', Role.GlobalSearch],
      result: false,
    },
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

describe('format name', () => {
  it.each([
    ['All names proper (no options)', 'John', 'James', 'Smith', undefined, 'John James Smith'],
    ['All names lower (no options)', 'john', 'james', 'smith', undefined, 'John James Smith'],
    ['All names upper (no options)', 'JOHN', 'JAMES', 'SMITH', undefined, 'John James Smith'],
    ['No middle names (no options)', 'JOHN', undefined, 'Smith', undefined, 'John Smith'],
    [
      'Multiple middle names (no options)',
      'John',
      'James GORDON william',
      'Smith',
      undefined,
      'John James Gordon William Smith',
    ],
    ['Hyphen (no options)', 'John', undefined, 'SMITH-JONES', undefined, 'John Smith-Jones'],
    ['Apostrophe (no options)', 'JOHN', 'JAMES', "O'sullivan", undefined, "John James O'Sullivan"],
    [
      'All names (LastCommaFirstMiddle)',
      'John',
      'James',
      'Smith',
      { style: 'lastCommaFirstMiddle' },
      'Smith, John James',
    ],
    [
      'First and last names (LastCommaFirstMiddle)',
      'John',
      undefined,
      'Smith',
      { style: 'lastCommaFirstMiddle' },
      'Smith, John',
    ],
    ['All names (LastCommaFirst)', 'John', 'James', 'Smith', { style: 'lastCommaFirst' }, 'Smith, John'],
    ['First name and last name (LastCommaFirst)', 'John', undefined, 'Smith', { style: 'firstLast' }, 'John Smith'],
  ])(
    '%s: formatName(%s, %s, %s, %s)',
    (
      _: string,
      firstName: string,
      middleNames: string,
      lastName: string,
      options: { style: 'firstMiddleLast' | 'lastCommaFirstMiddle' | 'lastCommaFirst' | 'firstLast' },
      expected: string,
    ) => {
      expect(formatName(firstName, middleNames, lastName, options)).toEqual(expected)
    },
  )
})

describe('formatLocation', () => {
  it('should cope with undefined', () => {
    expect(formatLocation(undefined)).toEqual(undefined)
  })

  it('should cope with null', () => {
    expect(formatLocation(null)).toEqual(undefined)
  })

  it('should preserve normal location names', () => {
    expect(formatLocation('MDI-1-1-1')).toEqual('MDI-1-1-1')
  })

  it('should convert RECP,CSWAP,COURT', () => {
    expect(formatLocation('RECP')).toEqual('Reception')
    expect(formatLocation('CSWAP')).toEqual('No cell allocated')
    expect(formatLocation('COURT')).toEqual('Court')
  })
})

describe('dateStringToAge', () => {
  it.each([
    ['2020-01-01', { years: 0, months: 0 }],
    ['2019-10-01', { years: 0, months: 3 }],
    ['2018-10-01', { years: 1, months: 3 }],
    ['1919-10-01', { years: 100, months: 3 }],
    ['1920-01-01', { years: 100, months: 0 }],
    ['1920-01-05', { years: 100, months: 0 }],
  ])('Number of years and months since %s', (dob: string, expectedAge: { years: number; months: number }) => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-10'))
    expect(calculateAge(dob)).toEqual(expectedAge)
    jest.useRealTimers()
  })
})

describe('arrayToQueryString()', () => {
  it('should split correctly when name is in LAST_NAME, FIRST_NAME format', () => {
    expect(arrayToQueryString(['string'], 'key')).toEqual('key=string')
  })
})

describe('mapToQueryString', () => {
  it('should handle null/undefined map', () => {
    expect(mapToQueryString(undefined)).toEqual('')
  })

  it('should handle empty maps', () => {
    expect(mapToQueryString({})).toEqual('')
  })

  it('should handle single key values', () => {
    expect(mapToQueryString({ key1: 'val' })).toEqual('key1=val')
  })

  it('should handle non-string, scalar values', () => {
    expect(mapToQueryString({ key1: 1, key2: true })).toEqual('key1=1&key2=true')
  })

  it('should ignore null values', () => {
    expect(mapToQueryString({ key1: 1, key2: null })).toEqual('key1=1')
  })

  it('should handle encode values', () => {
    expect(mapToQueryString({ key1: "Hi, I'm here" })).toEqual("key1=Hi%2C%20I'm%20here")
  })
})

describe('shouldLinkProfile', () => {
  it.each([
    [
      {
        user: { caseLoad: 'LEI', roles: [] },
        prisoner: { prisonId: 'LEI', status: 'ACTIVE_IN', bookingId: 1234 },
        expectedResult: true,
      },
    ],
    [
      {
        user: { caseLoad: 'LEI', roles: [] },
        prisoner: { prisonId: 'ABC', status: 'ACTIVE_IN', bookingId: 1234 },
        expectedResult: true,
      },
    ],
    [
      {
        user: { caseLoad: 'LEI', roles: [] },
        prisoner: { prisonId: 'OUT', status: 'OUT', bookingId: 1234 },
        expectedResult: false,
      },
    ],
    [
      {
        user: { caseLoad: 'LEI', roles: [Role.InactiveBookings] },
        prisoner: { prisonId: 'OUT', status: 'OUT', bookingId: 1234 },
        expectedResult: true,
      },
    ],
    [
      {
        user: { caseLoad: 'LEI', roles: [] },
        prisoner: { prisonId: 'TRN', status: 'ACTIVE_IN', bookingId: 1234 },
        expectedResult: true,
      },
    ],
  ])('Correctly links the profile', ({ user, prisoner, expectedResult }) => {
    expect(
      shouldLinkProfile(
        { activeCaseLoad: { caseLoadId: user.caseLoad }, userRoles: user.roles } as PrisonUser,
        { prisonId: prisoner.prisonId, status: prisoner.status, bookingId: prisoner.bookingId } as Prisoner,
      ),
    ).toEqual(expectedResult)
  })
})

describe('shouldShowProfileImage', () => {
  it.each([
    [
      {
        user: { caseLoads: ['LEI', 'MDI'] },
        prisoner: { prisonId: 'LEI' },
        expectedResult: true,
      },
    ],
    [
      {
        user: { caseLoads: ['LEI', 'MDI'] },
        prisoner: { prisonId: 'TRN' },
        expectedResult: true,
      },
    ],
    [
      {
        user: { caseLoads: ['LEI', 'MDI'] },
        prisoner: { prisonId: 'MDI' },
        expectedResult: true,
      },
    ],
    [
      {
        user: { caseLoads: ['LEI', 'MDI'] },
        prisoner: { prisonId: 'ABC' },
        expectedResult: false,
      },
    ],
  ])('Correctly shows the profile image', ({ user, prisoner, expectedResult }) => {
    expect(
      shouldShowProfileImage(
        {
          activeCaseLoad: { caseLoadId: user.caseLoads[0] },
          caseLoads: user.caseLoads.map(id => ({
            caseLoadId: id,
          })),
        } as PrisonUser,
        { prisonId: prisoner.prisonId } as Prisoner,
      ),
    ).toEqual(expectedResult)
  })
})

describe('shouldShowUpdateLicenceLink', () => {
  it.each([
    [
      {
        user: { roles: [] },
        prisoner: { status: 'ACTIVE_IN', bookingId: 1234 },
        expectedResult: false,
      },
    ],
    [
      {
        user: { roles: [Role.LicencesVary] },
        prisoner: { status: 'ACTIVE_IN', bookingId: 1234 },
        expectedResult: false,
      },
    ],
    [
      {
        user: { roles: [Role.LicencesReadOnly] },
        prisoner: { status: 'ACTIVE_IN', bookingId: 1234 },
        expectedResult: true,
      },
    ],
    [
      {
        user: { roles: [Role.LicencesReadOnly, Role.LicencesVary] },
        prisoner: { status: 'INACTIVE_OUT', bookingId: 1234 },
        expectedResult: true,
      },
    ],
    [
      {
        user: { roles: [Role.LicencesReadOnly, Role.LicencesVary] },
        prisoner: { status: 'INACTIVE_OUT', bookingId: undefined },
        expectedResult: false,
      },
    ],
  ])('Correctly links the licence edit URL', ({ user, prisoner, expectedResult }) => {
    expect(
      shouldShowUpdateLicenceLink(
        { userRoles: user.roles } as PrisonUser,
        { status: prisoner.status, bookingId: prisoner.bookingId } as Prisoner,
      ),
    ).toEqual(expectedResult)
  })
})
