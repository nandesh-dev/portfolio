import TestSVG from "./svg/test.svg?raw";
import { StoneMesh } from "@/meshes/stone";
import { Group } from "three";
import { SVGLoader } from "three/examples/jsm/Addons.js";

const TOTAL_SVG_SIZE = 48,
  SVG_CONTENT_SIZE = 32;

const PLATFORM_HEIGHT = 2;

const SVG_DIRECTIONS_MAP: Record<string, Partial<Directions>> = {
  [TestSVG]: {
    straight: true,
  },
};

type Directions = {
  right: boolean;
  slightRight: boolean;
  straight: boolean;
  slightLeft: boolean;
  left: boolean;
};

export class PlatformMesh extends Group {
  private directions: Directions;

  constructor(directions: Partial<Directions>) {
    super();

    this.directions = {
      right: false,
      slightRight: false,
      straight: false,
      slightLeft: false,
      left: false,
      ...directions,
    };

    let selectedSVG = null;
    for (const svg of Object.keys(SVG_DIRECTIONS_MAP)) {
      selectedSVG = svg;
      for (const direction of Object.keys(
        this.directions,
      ) as (keyof Directions)[]) {
        if (
          this.directions[direction] != !!SVG_DIRECTIONS_MAP[svg][direction]
        ) {
          selectedSVG = null;
          break;
        }
      }
      if (selectedSVG != null) {
        break;
      }
    }

    if (selectedSVG == null) {
      throw new Error("No Platform SVG found for given directions!");
    }

    const svgResult = new SVGLoader().parse(selectedSVG);

    for (let path of svgResult.paths) {
      const shape = SVGLoader.createShapes(path)[0];

      const stone = new StoneMesh(shape, PLATFORM_HEIGHT);
      stone.position.x -= TOTAL_SVG_SIZE / 2;
      stone.position.z -= TOTAL_SVG_SIZE / 2;
      this.add(stone);
    }

    this.rotateY(-Math.PI / 2);
  }

  public setProgress(progress: number) {
    for (let stone of this.children) {
      const k = stone.position.z / SVG_CONTENT_SIZE + 0.5; // Distance factor from start
      const l = Math.max(0, Math.min(1, k + progress)); // Y Displacement factor
      const m = -2 * l ** 2 + 3 * l; // Quadradic curve

      stone.position.y = (m - 1) * PLATFORM_HEIGHT;

      if (stone.position.y <= -PLATFORM_HEIGHT) {
        stone.visible = false;
      } else {
        stone.visible = true;
      }
    }
  }
}
