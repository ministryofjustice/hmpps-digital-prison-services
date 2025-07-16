import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core'
import { Document } from '@contentful/rich-text-types'
import { ManagedPage, ManagedPageApollo } from '../data/interfaces/managedPage'

export const managedPagesMock: ManagedPage[] = [
  {
    title: 'Title 1',
    slug: 'title-one',
    content: '<p>Content one<img src="http://localhost:8080/test.png" alt="Test description" /></p>',
  },
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
            content: [
              { data: {}, marks: [], value: 'Content one', nodeType: 'text' },
              {
                nodeType: 'embedded-asset-block',
                data: {
                  target: {
                    sys: {
                      id: '3bf9RIIvX9jvf1RZKmQZ1B',
                      type: 'Link',
                      linkType: 'Asset',
                    },
                  },
                },
                content: [],
              },
            ],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      } as unknown as Document,
      links: {
        assets: {
          block: [
            {
              sys: {
                id: '3bf9RIIvX9jvf1RZKmQZ1B',
              },
              __typename: 'Asset',
              contentType: 'image/png',
              url: 'http://localhost:8080/test.png',
              title: 'Test image',
              width: 640,
              height: 480,
              description: `Test description`,
            },
          ],
        },
      },
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

export const managedPagesCollectionMock: ApolloQueryResult<unknown> = {
  data: {
    managedPageCollection: {
      items: managedPagesApolloMock,
    },
  },
  loading: false,
  networkStatus: NetworkStatus.ready,
}
