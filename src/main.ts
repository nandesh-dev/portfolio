import { JourneyScene } from "@/scenes/journey";
/*
import { Direction, Tile } from "./object/tile";
import * as Journey from "./scene/journey";

const QPI = Math.PI * 0.25;

export const config: Journey.Config = {
  path: {
    angle: 0 * QPI,
    objects: [new Tile([Direction.Straight])],
    children: [
      {
        angle: QPI,
        objects: [new Tile([Direction.Straight])],
        children: [
          {
            angle: -QPI,
            objects: [new Tile([Direction.Straight])],
            children: [],
          },
        ],
      },
    ],
  },
};
*/

const journey = new JourneyScene(document.body);
journey.addEventListeners(window);
