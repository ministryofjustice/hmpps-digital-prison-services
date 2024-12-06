import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import { Response } from 'express'
import defaultServices from '../utils/defaultServices'

/**
 * Provide a list of services available for use in this application
 */
export default class ServiceData {
  public async getServiceData(res: Response): Promise<{ showServicesOutage: boolean; services: Service[] }> {
    if (res.locals.feComponents?.sharedData?.services)
      return { showServicesOutage: false, services: res.locals.feComponents.sharedData.services }

    return { showServicesOutage: true, services: defaultServices }
  }
}
