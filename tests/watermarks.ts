export const FixedWatermark = (fixedWatermark: number) => ({
  set: async (_: number) => {},
  get: async () => fixedWatermark,
})

export const InMemoryWatermark = (get: () => number, set: (w: number) => void) => ({
  set: async (w: number) => {
    set(w)
  },
  get: async () => get(),
})
