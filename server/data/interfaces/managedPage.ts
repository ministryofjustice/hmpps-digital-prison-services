import { Document } from '@contentful/rich-text-types'

export interface ManagedPage {
  title: string
  slug: string
  content?: string
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface ManagedPageApollo {
  title: string
  slug: string
  content?: {
    json: Document
    links?: any
  }
}
