import { Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadata, mapToQueryString } from '../utils/generateListMetadata'
import { formatName, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import { HealthAndMedicationData, ReferenceDataCodeWithComment } from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'

export default class DietaryRequirementsController {
  constructor(
    private readonly dietReportingService: DietReportingService,
    private readonly pdfReportingService: PdfRenderingService,
  ) {}

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 25 }
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string

      const sortNameQuery = () => {
        let direction = 'ASC'

        if (req.query.nameAndNumber && req.query.nameAndNumber === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({ nameAndNumber: direction, location: null, showAll: queryParams.showAll })
      }

      const sortLocationQuery = () => {
        let direction = 'ASC'

        if (req.query.location && req.query.location === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({ location: direction, nameAndNumber: null, showAll: queryParams.showAll })
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
          url: `/dietary-requirements?${sortNameQuery()}`,
        },
        location: {
          direction: sortParamToDirection(req.query.location as string),
          url: `/dietary-requirements?${sortLocationQuery()}`,
        },
      }

      // Remove page as this comes from the API
      const resp = await this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams)
      delete queryParams.page

      const listMetadata = generateListMetadata(resp, queryParams, 'result', [], '', true)

      return res.render('pages/dietaryRequirements', {
        content: resp.content.map(this.buildContent),
        listMetadata,
        sorting,
        printQuery: mapToQueryString({
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
          showAll: req.query.showAll as string,
        }),
      })
    }
  }

  public printAll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 25, showAll: true }
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string

      const resp = await this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams)

      return this.pdfReportingService.renderDietReport(clientToken, res, {
        content: resp.content.map(this.buildContent),
        datetime: format(new Date(), `cccc d MMMM yyyy 'at' HH:mm`),
        printQuery: mapToQueryString({
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
          showAll: req.query.showAll as string,
        }),
      })
      // return res.render('pages/printDietaryRequirements/header', {
      //   datetime: format(new Date(), `cccc d MMMM yyyy 'at' HH:mm`),
      //   content: resp.content.map(this.buildContent),
      //   backQuery: mapToQueryString({
      //     nameAndNumber: req.query.nameAndNumber as string,
      //     location: req.query.location as string,
      //     showAll: req.query.showAll as string,
      //   }),
      // })
      // return res.render('pages/printDietaryRequirements', {
      //   datetime: format(new Date(), `cccc d MMMM yyyy 'at' HH:mm`),
      //   content: resp.content.map(this.buildContent),
      //   backQuery: mapToQueryString({
      //     nameAndNumber: req.query.nameAndNumber as string,
      //     location: req.query.location as string,
      //     showAll: req.query.showAll as string,
      //   }),
      // })
    }
  }

  getEntries = (content?: ReferenceDataCodeWithComment[]) => {
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

  buildContent = (prisoner: HealthAndMedicationData) => {
    return {
      name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      prisonerNumber: prisoner.prisonerNumber,
      arrivalDate: prisoner.arrivalDate,
      location: prisoner.location,
      dietaryRequirements: {
        medical: this.getEntries(prisoner?.health?.dietAndAllergy?.medicalDietaryRequirements?.value),
        foodAllergies: this.getEntries(prisoner?.health?.dietAndAllergy?.foodAllergies?.value),
        personal: this.getEntries(prisoner?.health?.dietAndAllergy?.personalisedDietaryRequirements?.value),
        cateringInstructions: prisoner?.health?.dietAndAllergy?.cateringInstructions?.value,
      },
    }
  }
}
