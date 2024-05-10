import { AlertFlagLabel } from './AlertTypeLabel'
import { Prisoner } from '../../../data/interfaces/prisoner'

export interface PrisonerWithAlerts extends Prisoner {
  alertFlags: AlertFlagLabel[]
}
