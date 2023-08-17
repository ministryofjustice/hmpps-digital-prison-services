import Component from './component'

export interface ComponentApiClient {
  getComponent(component: 'header' | 'footer', userToken: string): Promise<Component>
}
