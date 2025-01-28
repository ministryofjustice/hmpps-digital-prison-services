import { query, Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadata, mapToQueryString } from '../utils/generateListMetadata'
import { formatName, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import { ReferenceDataCodeWithComment } from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'

export default class DietaryRequirementsController {
  constructor(private readonly dietReportingService: DietReportingService) {}

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware

      if (!userHasRoles([Role.DpsApplicationDeveloper], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 2 }
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string

      const sortNameQuery = () => {
        let direction = 'ASC'

        if (req.query.nameAndNumber && req.query.nameAndNumber === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({ nameAndNumber: direction, location: null })
      }

      const sortLocationQuery = () => {
        let direction = 'ASC'

        if (req.query.location && req.query.location === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({ location: direction, nameAndNumber: null })
      }

      const sortParamToDirection = (param: string) => {
        switch (param) {
          case 'ASC':
            return 'ascending'
          case 'DESC':
            return 'descending'
          default:
            return 'none'
        }
      }

      const sorting = {
        nameAndNumber: {
          direction: sortParamToDirection(req.query.nameAndNumber as string),
          url: `/dietary-requirements/${req.params.locationId}?${sortNameQuery()}`,
        },
        location: {
          direction: sortParamToDirection(req.query.location as string),
          url: `/dietary-requirements/${req.params.locationId}?${sortLocationQuery()}`,
        },
      }

      // Remove page as this comes from the API
      delete queryParams.page
      const resp = await this.dietReportingService.getDietaryRequirementsForPrison(
        clientToken,
        req.params.locationId,
        queryParams,
      )

      const listMetadata = generateListMetadata(resp, queryParams, 'result', [], '', true)

      const getEntries = (content?: ReferenceDataCodeWithComment[]) => {
        if (!content) return []
        const entries = content
          .filter(i => !i.value.id.endsWith('_OTHER'))
          .map(i => i.value.description)
          .sort()
        const other = content
          .filter(i => i.value.id.endsWith('_OTHER'))
          .map(i => `Other: ${i.comment}`)
          .sort()
        return [...entries, ...other]
      }

      return res.render('pages/dietaryRequirements', {
        content: resp.content.map(prisoner => {
          return {
            name: formatName(prisoner.firstName, '', prisoner.lastName),
            prisonerNumber: prisoner.prisonerNumber,
            location: prisoner.location,
            dietaryRequirements: {
              medical: getEntries(prisoner?.health?.dietAndAllergy?.medicalDietaryRequirements?.value),
              foodAllergies: getEntries(prisoner?.health?.dietAndAllergy?.foodAllergies?.value),
              personal: getEntries(prisoner?.health?.dietAndAllergy?.personalisedDietaryRequirements?.value),
            },
          }
        }),
        listMetadata,
        sorting,
        locationId: req.params.locationId,
      })
    }
  }

  public printAll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware

      if (!userHasRoles([Role.DpsApplicationDeveloper], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const resp = await this.dietReportingService.getDietaryRequirementsForPrison(clientToken, req.params.locationId, {
        page: 1,
        size: 10,
        showAll: true,
      })

      const getEntries = (content?: ReferenceDataCodeWithComment[]) => {
        if (!content) return []
        const entries = content
          .filter(i => !i.value.id.endsWith('_OTHER'))
          .map(i => i.value.description)
          .sort()
        const other = content
          .filter(i => i.value.id.endsWith('_OTHER'))
          .map(i => `Other: ${i.comment}`)
          .sort()
        return [...entries, ...other]
      }

      return res.render('pages/printDietaryRequirements', {
        datetime: format(new Date(), `cccc c MMMM yyyy 'at' HH:mm`),
        content: resp.content.map(prisoner => {
          return {
            name: formatName(prisoner.firstName, '', prisoner.lastName),
            prisonerNumber: prisoner.prisonerNumber,
            location: prisoner.location,
            dietaryRequirements: {
              medical: getEntries(prisoner?.health?.dietAndAllergy?.medicalDietaryRequirements?.value),
              foodAllergies: getEntries(prisoner?.health?.dietAndAllergy?.foodAllergies?.value),
              personal: getEntries(prisoner?.health?.dietAndAllergy?.personalisedDietaryRequirements?.value),
            },
          }
        }),
        locationId: req.params.locationId,
      })
    }
  }
}
