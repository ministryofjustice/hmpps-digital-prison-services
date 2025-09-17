import { Document } from '@contentful/rich-text-types'
import { ArticleTextLinks } from './contentful'

export interface ManagedPage {
  title: string
  slug: string
  content?: string
}

export interface ManagedPageApollo {
  title: string
  slug: string
  content?: {
    json: Document
    links?: ArticleTextLinks
  }
}

export interface ManagedPagesQuery {
  managedPageCollection: {
    items: ManagedPageApollo[]
  }
}

type ManagedPageCondition = { slug: string }
type ManagedPageFilter = ManagedPageCondition | { OR: ManagedPageCondition[] }

export interface ManagedPagesQueryVariables {
  condition: ManagedPageFilter
}
