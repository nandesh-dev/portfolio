import { CatmullRomCurve3, Euler, Vector3 } from 'three'

export type RawPathBlock = {
  angle: number
  branches?: RawPath[]
  nodes?: Node[]
}

export type RawPath = RawPathBlock[]

export type ComputedPathBlock = {
  position: Vector3
  rotation: Euler
  curve: CatmullRomCurve3
  elements: HTMLElement[]
  branches: ComputedPath[]
}

export type ComputedPath = ComputedPathBlock[]

export function computePath(
  rawPath: RawPath,
  basePosition: Vector3 = new Vector3(0, 0, 0),
  baseRotation: Euler = new Euler(0, 0, 0),
  parentCurvePoints: Vector3[] = []
): ComputedPath {
  let cummulativePosition = basePosition.clone()
  let cummulativeRotation = baseRotation.clone()
  let curvePoints = [...parentCurvePoints]

  return rawPath.map((rawPathBlock) => {
    cummulativeRotation.y += rawPathBlock.angle
    cummulativePosition.add(new Vector3(1, 0, 0).applyEuler(cummulativeRotation).setLength(6))
    curvePoints.push(cummulativePosition.clone())

    return {
      position: cummulativePosition.clone(),
      rotation: cummulativeRotation.clone(),
      branches:
        rawPathBlock.branches?.map((rawPath) =>
          computePath(rawPath, cummulativePosition, cummulativeRotation, curvePoints)
        ) || [],
      curve: new CatmullRomCurve3([...curvePoints], false, 'centripetal', 1),
      elements:
        rawPathBlock.nodes?.map((node) => {
          const element = document.createElement('div')
          element.append(node)
          return element
        }) || [],
    }
  })
}
