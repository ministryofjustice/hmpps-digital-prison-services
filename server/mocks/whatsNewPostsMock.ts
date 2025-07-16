import { ApolloQueryResult, NetworkStatus } from '@apollo/client/core'
import { Document } from '@contentful/rich-text-types'
import { WhatsNewPost, WhatsNewPostApollo } from '../data/interfaces/whatsNewPost'

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

export const whatsNewPostsCollectionMock: ApolloQueryResult<unknown> = {
  data: {
    whatsNewPostCollection: {
      total: 3,
      limit: 3,
      skip: 0,
      items: whatsNewPostsApolloMock,
    },
  },
  loading: false,
  networkStatus: NetworkStatus.ready,
}

export const whatsNewPostCollectionMock: ApolloQueryResult<unknown> = {
  data: {
    whatsNewPostCollection: {
      items: whatsNewPostApolloMock,
    },
  },
  loading: false,
  networkStatus: NetworkStatus.ready,
}
