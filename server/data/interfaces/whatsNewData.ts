import { WhatsNewPost } from './whatsNewPost'
import { Pagination } from './pagination'

export interface WhatsNewData {
  whatsNewPosts: WhatsNewPost[]
  pagination: Pagination
}
