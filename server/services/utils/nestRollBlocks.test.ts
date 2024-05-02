import { BlockRollCount } from '../../data/interfaces/blockRollCount'
import nestRollBlocks, { splitRollBlocks } from './nestRollBlocks'

describe('nestRollBlocks', () => {
  describe('when there are wings and landings', () => {
    const blocks: Partial<BlockRollCount>[] = [
      { livingUnitId: 1 },
      { livingUnitId: 2 },
      { livingUnitId: 3, parentLocationId: 1 },
      { livingUnitId: 4, parentLocationId: 1 },
      { livingUnitId: 5, parentLocationId: 2 },
      { livingUnitId: 6, parentLocationId: 2 },
    ]

    it('should nest the landings withing the parent wing', () => {
      const splitBlocks = splitRollBlocks(blocks as BlockRollCount[])
      const response = nestRollBlocks(splitBlocks)
      expect(response).toEqual([
        {
          livingUnitId: 1,
          landings: [
            { livingUnitId: 3, parentLocationId: 1 },
            { livingUnitId: 4, parentLocationId: 1 },
          ],
        },
        {
          livingUnitId: 2,
          landings: [
            { livingUnitId: 5, parentLocationId: 2 },
            { livingUnitId: 6, parentLocationId: 2 },
          ],
        },
      ])
    })
  })

  describe('when there are wings, spurs and landings', () => {
    const blocks: Partial<BlockRollCount>[] = [
      { livingUnitId: 1 },
      { livingUnitId: 2 },
      { livingUnitId: 3, parentLocationId: 1 },
      { livingUnitId: 4, parentLocationId: 1 },
      { livingUnitId: 5, parentLocationId: 2 },
      { livingUnitId: 6, parentLocationId: 2 },
      { livingUnitId: 7, parentLocationId: 3 },
      { livingUnitId: 8, parentLocationId: 4 },
      { livingUnitId: 9, parentLocationId: 5 },
      { livingUnitId: 10, parentLocationId: 6 },
    ]

    it('should nest the wings, spurs and landings', () => {
      const splitBlocks = splitRollBlocks(blocks as BlockRollCount[])
      const response = nestRollBlocks(splitBlocks)
      expect(response).toEqual([
        {
          livingUnitId: 1,
          spurs: [
            {
              livingUnitId: 3,
              parentLocationId: 1,
              landings: [{ livingUnitId: 7, parentLocationId: 3 }],
            },
            {
              livingUnitId: 4,
              parentLocationId: 1,
              landings: [{ livingUnitId: 8, parentLocationId: 4 }],
            },
          ],
        },
        {
          livingUnitId: 2,
          spurs: [
            {
              livingUnitId: 5,
              parentLocationId: 2,
              landings: [{ livingUnitId: 9, parentLocationId: 5 }],
            },
            {
              livingUnitId: 6,
              parentLocationId: 2,
              landings: [{ livingUnitId: 10, parentLocationId: 6 }],
            },
          ],
        },
      ])
    })
  })

  describe('when there is a mixture of wings, spurs and landings', () => {
    const blocks: Partial<BlockRollCount>[] = [
      { livingUnitId: 1 },
      { livingUnitId: 2 },
      { livingUnitId: 3, parentLocationId: 1 },
      { livingUnitId: 4, parentLocationId: 1 },
      { livingUnitId: 5, parentLocationId: 2 },
      { livingUnitId: 6, parentLocationId: 2 },
      { livingUnitId: 7, parentLocationId: 5 },
      { livingUnitId: 8, parentLocationId: 5 },
    ]

    it('should nest the wings, spurs and landings', () => {
      const splitBlocks = splitRollBlocks(blocks as BlockRollCount[])
      const response = nestRollBlocks(splitBlocks)
      expect(response).toEqual([
        {
          livingUnitId: 1,
          landings: [
            { livingUnitId: 3, parentLocationId: 1 },
            { livingUnitId: 4, parentLocationId: 1 },
          ],
        },
        {
          livingUnitId: 2,
          spurs: [
            {
              livingUnitId: 5,
              parentLocationId: 2,
              landings: [
                { livingUnitId: 7, parentLocationId: 5 },
                { livingUnitId: 8, parentLocationId: 5 },
              ],
            },
          ],
          landings: [{ livingUnitId: 6, parentLocationId: 2 }],
        },
      ])
    })
  })
})
