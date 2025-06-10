import { CatmullRomCurve3, type Vector3 } from 'three'

export class Curve extends CatmullRomCurve3 {
    public getPointFromDistance(distance: number, target?: Vector3): Vector3 {
        return this.getPoint(this.getUtoTmapping(0, distance), target)
    }

    public getTangentFromDistance(distance: number, target?: Vector3): Vector3 {
        return this.getTangent(this.getUtoTmapping(0, distance), target)
    }

    public getDistanceFromPoint(point: Vector3): number {
        let displacement = this.getPointFromDistance(0).distanceToSquared(point)
        const length = this.getLength()
        for (let distance = 0; distance <= length; distance += 0.1) {
            const newDisplacement = point.distanceToSquared(
                this.getPointFromDistance(distance)
            )
            if (newDisplacement > displacement) return distance
            displacement = newDisplacement
        }
        return length
    }
}
