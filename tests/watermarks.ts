export const FixedWatermark = (fixedWatermark: bigint) => ({
  set: async (_: bigint) => {},
  get: async () => fixedWatermark,
})

export const InMemoryWatermark = (get: () => bigint, set: (w: bigint) => void) => ({
  set: async (w: bigint) => {
    set(w)
  },
  get: async () => get(),
})
