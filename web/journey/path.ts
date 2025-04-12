export type PathBlock = {
  angle: number
  branchPath?: Path[]
  elements?: HTMLElement[]
}

export type Path = PathBlock[]

export const JourneyPath: Path = [
  {
    angle: (0 * Math.PI) / 180,
  },
  {
    angle: (45 * Math.PI) / 180,
  },
  {
    angle: (45 * Math.PI) / 180,
  },
  {
    angle: (0 * Math.PI) / 180,
  },
  {
    angle: (-45 * Math.PI) / 180,
  },
]
