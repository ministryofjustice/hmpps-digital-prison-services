import { Document } from '@contentful/rich-text-types'

export interface WhatsNewPost {
  title: string
  slug: string
  body?: string
  summary: string
  date: string
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface WhatsNewPostApollo {
  title: string
  slug: string
  body?: {
    json: Document
    links?: any
  }
  summary: string
  date: string
}
