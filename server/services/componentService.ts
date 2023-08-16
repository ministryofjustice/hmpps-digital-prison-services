import { RestClientBuilder } from '../data'
import { ComponentApiClient } from '../data/interfaces/componentApiClient'
import Component from '../data/interfaces/component'

export default class ComponentService {
  constructor(private readonly componentApiClientBuilder: RestClientBuilder<ComponentApiClient>) {}

  public async getComponent(component: 'header' | 'footer', userToken: string): Promise<Component> {
    return this.componentApiClientBuilder(userToken).getComponent(component, userToken)
  }
}
