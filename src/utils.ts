export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunkedArray: T[][] = []
  let i = 0

  while (i < array.length) {
    chunkedArray.push(array.slice(i, (i += chunkSize)))
  }

  return chunkedArray
}

export function range(start: number, end: number) {
  return [...Array(end - start + 1).keys()].map((i) => i + start)
}

// https://github.com/whatwg/dom/issues/946#issuecomment-845924476
export function race<T>(promise: Promise<T>, signal: AbortSignal) {
  return Promise.race([toPromise(signal), promise])
}

const promises = new WeakMap<AbortSignal, Promise<DOMException>>()
function toPromise(signal: AbortSignal) {
  if (!promises.has(signal)) {
    promises.set(
      signal,
      new Promise((resolve) => {
        const propagate = () => {
          signal.removeEventListener('abort', propagate)
          resolve(new DOMException(signal.reason ?? 'Aborted', 'AbortError'))
        }

        if (signal.aborted) {
          propagate()
        } else {
          signal.addEventListener('abort', propagate)
        }
      }),
    )
  }

  return promises.get(signal)
}

export async function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve()
      signal.removeEventListener('abort', abort)
    }, ms)

    const abort = () => {
      clearTimeout(timeout)
      resolve()
    }

    signal.addEventListener('abort', abort)
    if (signal.aborted) {
      abort()
    }
  })
}
