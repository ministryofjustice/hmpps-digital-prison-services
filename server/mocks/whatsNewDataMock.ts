import { WhatsNewData } from '../data/interfaces/whatsNewData'
import { whatsNewPostsMock } from './whatsNewPostsMock'
import { paginationMock } from './paginationMock'

export const whatsNewDataMock: WhatsNewData = {
  whatsNewPosts: whatsNewPostsMock,
  pagination: paginationMock,
}

export default { whatsNewDataMock }
