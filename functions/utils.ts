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
