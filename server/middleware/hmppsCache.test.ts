import HmppsCache from './hmppsCache'

describe('HmppsCache', () => {
  let cache: HmppsCache
  const func = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should ignore cache and directly return results of given function if ttl is 0', async () => {
    cache = new HmppsCache(0)

    await cache.wrap('key', func)
    await cache.wrap('key', func)
    await cache.wrap('key', func)

    expect(func).toHaveBeenCalledTimes(3)
  })

  it('should cache result of function call per key', async () => {
    cache = new HmppsCache(1)

    await cache.wrap('key', func)
    await cache.wrap('key', func)
    await cache.wrap('key', func)
    await cache.wrap('key2', func)
    await cache.wrap('key2', func)
    await cache.wrap('key2', func)

    expect(func).toHaveBeenCalledTimes(2)
  })

  it('should return correct data from cache', async () => {
    cache = new HmppsCache(1)
    const mockData = {
      stringVal: 'stringVal',
      numberVal: 99,
      booleanVal: true,
      objectVal: {
        nestedStringVal: 'stringVal',
        nestedNumberVal: 99,
        nestedBooleanVal: true,
      },
    }
    const fn = async () => {
      return mockData
    }

    const result = await cache.wrap('key', fn)

    expect(result).toEqual(mockData)
  })
})
