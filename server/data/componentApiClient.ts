import RestClient from './restClient'
import { ComponentApiClient, ComponentsApiResponse } from './interfaces/componentApiClient'
import AvailableComponent from './interfaces/AvailableComponent'

export default class ComponentApiRestClient implements ComponentApiClient {
  constructor(private restClient: RestClient) {}

  getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string,
    useLatest: boolean,
  ): Promise<ComponentsApiResponse<T>> {
    const useLatestHeader = useLatest ? { 'x-use-latest-features': 'true' } : {}
    return this.restClient.get<ComponentsApiResponse<T>>({
      path: `/components`,
      query: `component=${components.join('&component=')}`,
      headers: { 'x-user-token': userToken, ...useLatestHeader },
    })
  }
}
