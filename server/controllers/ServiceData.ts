import { Response } from 'express'
import { Service } from '../data/interfaces/component'
import defaultServices from '../utils/defaultServices'

/**
 * Provide a list of services available for use in this application
 */
export default class ServiceData {
  public async getServiceData(res: Response): Promise<{ showServicesOutage: boolean; services: Service[] }> {
    if (res.locals.feComponentsMeta?.services)
      return { showServicesOutage: false, services: res.locals.feComponentsMeta.services }

    return { showServicesOutage: true, services: defaultServices }
  }
}
