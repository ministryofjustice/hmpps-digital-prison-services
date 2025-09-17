import { Document } from '@contentful/rich-text-types'
import { ArticleTextLinks } from './contentful'

export interface WhatsNewPost {
  title: string
  slug: string
  body?: string
  summary: string
  date: string
}

export interface WhatsNewPostApollo {
  title: string
  slug: string
  body?: {
    json: Document
    links?: ArticleTextLinks
  }
  summary: string
  date: string
  prisons?: string[]
}

export interface WhatsNewPostsQuery {
  whatsNewPostCollection: {
    total: number
    limit: number
    skip: number
    items: WhatsNewPost[]
  }
}

export interface WhatsNewPostWithSlugQuery {
  whatsNewPostCollection: {
    items: WhatsNewPostApollo[]
  }
}

type WhatsNewPostCondition = { slug: string } | { prisons_exists: boolean } | { prisons_contains_some: string }
type WhatsNewPostFilter = WhatsNewPostCondition | { OR: WhatsNewPostCondition[] }

export interface WhatsNewPostsQueryVariables {
  limit?: number
  skip?: number
  condition: WhatsNewPostFilter
}
