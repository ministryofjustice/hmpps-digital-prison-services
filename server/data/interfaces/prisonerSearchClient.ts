import { Prisoner } from './prisoner'

export interface PrisonerSearchClient {
  getPrisonersById(prisonerNumbers: string[]): Promise<Prisoner[]>
}
