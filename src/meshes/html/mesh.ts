import { div } from "@/utils/elements";
import { CSS3DObject } from "three/examples/jsm/Addons.js";

const SCALE = 0.02;
const HEIGHT = 20;

export class HTMLMesh extends CSS3DObject {
  private outer: HTMLElement;
  constructor(element: HTMLElement) {
    const outer = div(
      {
        style: {
          pointerEvents: "auto",
          userSelect: "text",
          height: "0px",
          width: "0px",
        },
      },
      div(
        {
          style: {
            minWidth: "100dvw",
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translate(-50%, -50%)",
          },
        },
        element,
      ),
    );

    const container = div({}, outer);
    super(container);

    this.outer = outer;

    this.rotateY(-Math.PI / 2);
    this.scale.set(SCALE, SCALE, SCALE);
    this.position.setY(HEIGHT);
  }

  public setProgress(progress: number) {
    const DISAPPEAR_START = -0.2,
      DISAPPEAR_END = -0.01;

    this.outer.style.opacity = Math.min(
      1,
      Math.max(
        0,
        1 - (progress - DISAPPEAR_START) / (DISAPPEAR_END - DISAPPEAR_START),
      ),
    ).toString();
    console.log(progress);
  }
}
