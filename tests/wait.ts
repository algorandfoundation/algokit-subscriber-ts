export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitFor<T>(test: () => Promise<T> | T, timeoutMs = 20 * 1000) {
  const endTime = Date.now() + timeoutMs
  let result = await test()
  while (!result) {
    if (Date.now() > endTime) {
      // eslint-disable-next-line no-console
      console.error(`Timed out`)
      return false
    }
    await sleep(50)
    result = await test()
  }
  return result
}
