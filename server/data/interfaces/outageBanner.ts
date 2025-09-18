import { Document } from '@contentful/rich-text-types'

export interface OutageBannerApollo {
  text: {
    json: Document
  }
  prisons?: string[]
  development?: boolean
  preProduction?: boolean
  production?: boolean
}

export interface OutageBannerQuery {
  outageBannerCollection: {
    items: OutageBannerApollo[]
  }
}

type OutageBannerCondition =
  | { prisons_exists: boolean }
  | { prisons_contains_some: string }
  | { development: boolean }
  | { preProduction: boolean }
  | { production: boolean }
type OutageBannerFilter = OutageBannerCondition | { OR: OutageBannerFilter[] } | { AND: OutageBannerFilter[] }

export interface OutageBannerQueryVariables {
  condition: OutageBannerFilter
}
