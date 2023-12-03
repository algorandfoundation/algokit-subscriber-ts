export const FixedWatermark = (fixedWatermark: number) => ({
  set: async (_: number) => {},
  get: async () => fixedWatermark,
})
