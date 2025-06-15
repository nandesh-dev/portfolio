import { Vector3 } from 'three'
import type { Unsafe } from './error'

export type CurvePoint = {
    position: Vector3
    direction: Vector3
}

export type CurveSegment = (position: number) => CurvePoint

export class Curve {
    private segments: CurveSegment[]

    constructor() {
        this.segments = []
    }

    public addSegment(segment: CurveSegment) {
        this.segments.push(segment)
    }

    public getPoint(distance: number): Unsafe<CurvePoint, Error> {
        const segment = this.segments[Math.floor(distance)]
        if (!segment) {
            return [null, new Error('Segment not found')]
        }
        return [segment(distance % 1), null]
    }

    public get length(): number {
        return this.segments.length
    }
}
