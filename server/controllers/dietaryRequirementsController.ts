import { Request, RequestHandler, Response } from 'express'
import { DietaryRequirementsQueryParams, generateListMetadata, mapToQueryString } from '../utils/generateListMetadata'
import { userHasRoles } from '../utils/utils'

export default class DietaryRequirementsController {
  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (!userHasRoles(['DPS_APPLICATION_DEVELOPER'], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = {}
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string

      const content = [
        {
          name: 'Richard Smith',
          prisonerNumber: 'G4879UP',
          location: 'C-3-010',
          dietaryRequirements: {
            medical: ['Coeliac (cannot eat gluten)', 'Nutrient Deficiency', 'Other: has to eat a low copper diet'],
            foodAllergies: ['Egg', 'Other: broccoli allergy'],
            personal: [] as string[],
          },
        },
        {
          name: 'George Harrison',
          prisonerNumber: 'G6333VK',
          location: 'B-1-042',
          dietaryRequirements: {
            medical: [],
            foodAllergies: ['Sesame'],
            personal: [],
          },
        },
        {
          name: 'Harry Thompson',
          prisonerNumber: 'G3101UO',
          location: 'F-5-031',
          dietaryRequirements: {
            medical: [],
            foodAllergies: [],
            personal: ['Kosher'],
          },
        },
      ]

      const sortNameQuery = () => {
        let direction = 'ASC'

        if (queryParams.nameAndNumber && queryParams.nameAndNumber === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({ ...queryParams, nameAndNumber: direction, location: null })
      }

      const sortLocationQuery = () => {
        let direction = 'ASC'

        if (queryParams.location && queryParams.location === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({ ...queryParams, location: direction, nameAndNumber: null })
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
          direction: sortParamToDirection(queryParams.nameAndNumber as string),
          url: `/dietary-requirements/${req.params.locationId}?${sortNameQuery()}`,
        },
        location: {
          direction: sortParamToDirection(queryParams.location as string),
          url: `/dietary-requirements/${req.params.locationId}?${sortLocationQuery()}`,
        },
      }

      // Remove page as this comes from the API
      delete queryParams.page

      const listMetadata = generateListMetadata(
        {
          content,
          totalElements: 200,
          last: false,
          totalPages: 10,
          size: 10,
          number: 0,
          sort: { empty: false, sorted: false, unsorted: true },
          first: false,
          numberOfElements: 20,
          empty: false,
          pageable: {
            pageNumber: 5,
            pageSize: 20,
            sort: {
              empty: true,
              sorted: false,
              unsorted: true,
            },
            offset: 0,
            unpaged: false,
            paged: true,
          },
        },
        queryParams,
        'result',
        [],
        '',
        true,
      )

      return res.render('pages/dietaryRequirements', { content, listMetadata, sorting })
    }
  }
}
