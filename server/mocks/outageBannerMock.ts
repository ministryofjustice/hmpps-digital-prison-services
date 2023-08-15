import { Document } from '@contentful/rich-text-types'
import { OutageBannerApollo } from '../data/interfaces/outageBanner'

export const outageBannerApolloMock: OutageBannerApollo[] = [
  {
    text: {
      json: {
        data: {},
        content: [
          {
            data: {},
            content: [{ data: {}, marks: [], value: 'Banner', nodeType: 'text' }],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      } as unknown as Document,
    },
  },
]

export const outageBannerCollectionMock = {
  data: {
    outageBannerCollection: {
      items: outageBannerApolloMock,
    },
  },
}
