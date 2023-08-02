import { Document } from '@contentful/rich-text-types'
import { WhatsNewPost, WhatsNewPostApollo } from '../data/interfaces/whatsNewPost'

// eslint-disable-next-line import/prefer-default-export
export const whatsNewPostsMock: WhatsNewPost[] = [
  {
    title: 'Whats new one',
    slug: 'whats-new-one',
    summary: 'Summary',
    date: '2023-07-27',
  },
  {
    title: 'Whats new two',
    slug: 'whats-new-two',
    summary: 'Summary',
    date: '2023-07-25',
  },
  {
    title: 'Whats new three',
    slug: 'whats-new-three',
    summary: 'Summary',
    date: '2023-07-21',
  },
]

export const whatsNewPostMock: WhatsNewPost = {
  title: 'Whats new one',
  slug: 'whats-new-one',
  summary: 'Summary',
  body: '<p>Content</p>',
  date: '2023-07-27',
}

export const whatsNewPostsApolloMock: WhatsNewPostApollo[] = [
  {
    title: 'Whats new one',
    slug: 'whats-new-one',
    summary: 'Summary',
    date: '2023-07-27',
  },
  {
    title: 'Whats new two',
    slug: 'whats-new-two',
    summary: 'Summary',
    date: '2023-07-25',
  },
  {
    title: 'Whats new three',
    slug: 'whats-new-three',
    summary: 'Summary',
    date: '2023-07-21',
  },
]

export const whatsNewPostApolloMock: WhatsNewPostApollo[] = [
  {
    title: 'Whats new one',
    slug: 'whats-new-one',
    summary: 'Summary',
    body: {
      json: {
        data: {},
        content: [
          {
            data: {},
            content: [{ data: {}, marks: [], value: 'Content', nodeType: 'text' }],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      } as unknown as Document,
    },
    date: '2023-07-27',
  },
]

export const whatsNewPostsCollectionMock = {
  data: {
    whatsNewPostCollection: {
      items: whatsNewPostsApolloMock,
    },
  },
}

export const whatsNewPostCollectionMock = {
  data: {
    whatsNewPostCollection: {
      items: whatsNewPostApolloMock,
    },
  },
}
