import EstablishmentRollSummary from '../services/interfaces/establishmentRollService/EstablishmentRollSummary'

export const prisonEstablishmentRollSummaryMock: EstablishmentRollSummary = {
  prisonId: 'LEI',
  numUnlockRollToday: 20,
  numArrivedToday: 30,
  numOutToday: 40,
  numCurrentPopulation: 50,
}

export default { prisonEstablishmentRollSummaryMock }
