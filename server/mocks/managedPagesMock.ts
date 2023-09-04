import { Document } from '@contentful/rich-text-types'
import { ManagedPage, ManagedPageApollo } from '../data/interfaces/managedPage'

export const managedPagesMock: ManagedPage[] = [
  { title: 'Title 1', slug: 'title-one', content: '<p>Content one</p>' },
  { title: 'Title 2', slug: 'title-two', content: '<p>Content two</p>' },
]

export const managedPagesApolloMock: ManagedPageApollo[] = [
  {
    title: 'Title 1',
    slug: 'title-one',
    content: {
      json: {
        data: {},
        content: [
          {
            data: {},
            content: [{ data: {}, marks: [], value: 'Content one', nodeType: 'text' }],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      } as unknown as Document,
    },
  },
  {
    title: 'Title 2',
    slug: 'title-two',
    content: {
      json: {
        data: {},
        content: [
          {
            data: {},
            content: [{ data: {}, marks: [], value: 'Content two', nodeType: 'text' }],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      } as unknown as Document,
    },
  },
]

export const managedPagesCollectionMock = {
  data: {
    managedPageCollection: {
      items: managedPagesApolloMock,
    },
  },
}
