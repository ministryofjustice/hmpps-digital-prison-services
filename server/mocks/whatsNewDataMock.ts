import { WhatsNewData } from '../data/interfaces/whatsNewData'
import { whatsNewPostsMock } from './whatsNewPostsMock'
import { paginationMock } from './paginationMock'

// eslint-disable-next-line import/prefer-default-export
export const whatsNewDataMock: WhatsNewData = {
  whatsNewPosts: whatsNewPostsMock,
  pagination: paginationMock,
}
