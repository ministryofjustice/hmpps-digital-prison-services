import { Document } from '@contentful/rich-text-types'
import { WhatsNewPost } from '../data/interfaces/whatsNewPost'

// eslint-disable-next-line import/prefer-default-export
export const whatsNewPostsMock: WhatsNewPost[] = [
  {
    title: 'Whats new one',
    slug: 'whats-new-one',
    summary: 'Summary',
    body: 'Content',
    date: '2023-07-27',
    prisons: undefined,
  },
  {
    title: 'Whats new two',
    slug: 'whats-new-two',
    summary: 'Summary',
    body: 'Content',
    date: '2023-07-25',
    prisons: undefined,
  },
  {
    title: 'Whats new three',
    slug: 'whats-new-three',
    summary: 'Summary',
    body: 'Content',
    date: '2023-07-21',
    prisons: undefined,
  },
]

export const contentfulWhatsNewPostEntriesMock = {
  items: [
    {
      fields: {
        title: 'title',
        summary: 'summary',
        slug: 'slug',
        body: {
          data: {},
          content: [
            {
              data: {},
              content: [{ data: {}, marks: [], value: 'body', nodeType: 'text' }],
              nodeType: 'paragraph',
            },
          ],
          nodeType: 'document',
        } as unknown as Document,
        date: '2023-07-27',
        prisons: ['LEI'],
      },
    },
    {
      fields: {
        title: 'title',
        summary: 'summary',
        slug: 'slug',
        body: {
          data: {},
          content: [
            {
              data: {},
              content: [{ data: {}, marks: [], value: 'body', nodeType: 'text' }],
              nodeType: 'paragraph',
            },
          ],
          nodeType: 'document',
        } as unknown as Document,
        date: '2023-07-27',
        prisons: ['LEI'],
      },
    },
    {
      fields: {
        title: 'title',
        summary: 'summary',
        slug: 'slug',
        body: {
          data: {},
          content: [
            {
              data: {},
              content: [{ data: {}, marks: [], value: 'body', nodeType: 'text' }],
              nodeType: 'paragraph',
            },
          ],
          nodeType: 'document',
        } as unknown as Document,
        date: '2023-07-27',
        prisons: ['LEI'],
      },
    },
  ],
}
