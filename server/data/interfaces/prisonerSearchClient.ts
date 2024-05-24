import { Prisoner } from './prisoner'
import { PagedList } from './pagedList'

export interface PrisonerSearchClient {
  getPrisonersById(prisonerNumbers: string[]): Promise<Prisoner[]>
  getCswapPrisonersInEstablishment(prisonId: string): Promise<PagedList<Prisoner>>
}
