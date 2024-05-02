import { BlockRollCount } from '../../data/interfaces/blockRollCount'
import { Landing, Spur, Wing } from '../interfaces/establishmentRollService/EstablishmentRollCount'

const blockHasParent = (block: BlockRollCount) => !!block.parentLocationId
const blockHasChildren = (block: BlockRollCount, allBlocks: BlockRollCount[]) =>
  !!allBlocks.find(b => b.parentLocationId === block.livingUnitId)

interface WingsSpursLandings {
  wings: Wing[]
  spurs: Spur[]
  landings: Landing[]
}

export const splitRollBlocks = (rollBlocks: BlockRollCount[]): WingsSpursLandings => {
  return rollBlocks.reduce<WingsSpursLandings>(
    (acc, block) => {
      if (!blockHasParent(block)) return { ...acc, wings: [...acc.wings, { ...block }] }
      if (blockHasChildren(block, rollBlocks)) return { ...acc, spurs: [...acc.spurs, { ...block }] }
      return { ...acc, landings: [...acc.landings, { ...block }] }
    },
    { wings: [], spurs: [], landings: [] },
  )
}

export default ({ wings, spurs, landings }: WingsSpursLandings): Wing[] => {
  const spursWithLandings = spurs.map(spur => {
    const spurLandings = landings.filter(landing => landing.parentLocationId === spur.livingUnitId)
    return { ...spur, landings: spurLandings }
  })

  return wings.map(wing => {
    const wingSpurs = spursWithLandings.filter(spur => spur.parentLocationId === wing.livingUnitId)
    const wingWithSpurs = wingSpurs.length ? { ...wing, spurs: wingSpurs } : wing

    const wingLandings = landings.filter(landing => landing.parentLocationId === wing.livingUnitId)
    return wingLandings.length ? { ...wingWithSpurs, landings: wingLandings } : wingWithSpurs
  })
}
