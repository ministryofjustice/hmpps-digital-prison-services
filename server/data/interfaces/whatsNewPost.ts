import { Document } from '@contentful/rich-text-types'

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
  }
  summary: string
  date: string
}
