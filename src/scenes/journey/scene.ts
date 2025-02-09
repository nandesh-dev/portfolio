import {
  CatmullRomCurve3,
  Color,
  Group,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { PlatformMesh } from "@/meshes/platform";

const CAMERA_FOV = 75,
  CAMERA_NEAR_POINT = 0.1,
  CAMERA_FAR_POINT = 1000,
  CAMERA_HEIGHT = 10;

const JOURNEY_STARTING_POSITION = Object.freeze(new Vector3(0, 0, 0)),
  JOURNEY_STARTING_ANGLE = 0;

const NODE_SIZE = 32;

interface NodeObject {
  setProgress(progress: number): void;
}

class Node {
  public relativeAngle: number;
  public group: Group;
  public children: Node[];
  public selected: boolean;

  private absoluteAngle: number;

  constructor(
    angle: number,
    objects: (Object3D & NodeObject)[],
    children: Node[] = [],
  ) {
    this.relativeAngle = angle;
    this.absoluteAngle = 0;
    this.group = new Group();
    for (const object of objects) {
      this.group.add(object);
    }
    this.children = children;
    this.selected = children.length <= 1;
  }

  public setPosition(position: Vector3) {
    this.group.position.copy(position);

    for (const child of this.children) {
      child.setPosition(
        new Vector3(
          NODE_SIZE * Math.cos(this.absoluteAngle + child.relativeAngle),
          0,
          NODE_SIZE * Math.sin(this.absoluteAngle + child.relativeAngle),
        ).add(position),
      );
    }
  }

  public setRotation(angle: number) {
    this.group.rotateY(-(angle - this.absoluteAngle));
    this.absoluteAngle = angle;

    for (const child of this.children) {
      child.setRotation(this.absoluteAngle + child.relativeAngle);
    }
  }
}

function buildJourneyNodes() {
  const PI = Math.PI;
  return new Node(
    JOURNEY_STARTING_ANGLE,
    [new PlatformMesh({ straight: true })],
    [
      new Node(
        PI / 4,
        [new PlatformMesh({ straight: true })],
        [
          new Node(
            PI / 4,
            [new PlatformMesh({ straight: true })],
            [
              new Node(
                -PI / 4,
                [new PlatformMesh({ straight: true })],
                [
                  new Node(
                    -PI / 4,
                    [new PlatformMesh({ straight: true })],
                    [
                      new Node(
                        -PI / 4,
                        [new PlatformMesh({ straight: true })],
                        [
                          new Node(
                            -PI / 4,
                            [new PlatformMesh({ straight: true })],
                            [
                              new Node(
                                0,
                                [new PlatformMesh({ straight: true })],
                                [
                                  new Node(
                                    PI / 2,
                                    [new PlatformMesh({ straight: true })],
                                    [
                                      new Node(
                                        PI / 4,
                                        [new PlatformMesh({ straight: true })],
                                        [
                                          new Node(-PI / 4, [
                                            new PlatformMesh({
                                              straight: true,
                                            }),
                                          ]),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

class Progress {
  public value: number;
  private velocity: number;

  constructor(initialValue: number) {
    this.value = initialValue
    this.velocity = 0
  }

  tick(deltaTime: number) {
    const RESISTANCE = 0.002;

    this.value += deltaTime * this.velocity
    this.velocity -= deltaTime * RESISTANCE * this.velocity

    this.value = Math.max(0, this.value)
  }

  push(force: number) {
    const FORCE_CONSTANT = 0.00003
    this.velocity += force * FORCE_CONSTANT
  }
}

export class JourneyScene {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private webGLRenderer: WebGLRenderer;
  private containerDOMElement: HTMLElement;
  private rootNode: Node;
  private progress: Progress;
  private lastRenderTime: number;

  constructor(containerDOMElement: HTMLElement) {
    this.containerDOMElement = containerDOMElement;

    this.progress = new Progress(0);

    this.scene = new Scene();
    this.scene.background = new Color("white");

    const width = this.containerDOMElement.offsetWidth,
      height = this.containerDOMElement.offsetHeight;

    this.camera = new PerspectiveCamera(
      CAMERA_FOV,
      width / height,
      CAMERA_NEAR_POINT,
      CAMERA_FAR_POINT,
    );

    this.webGLRenderer = new WebGLRenderer();
    this.webGLRenderer.setSize(width, height);

    this.containerDOMElement.appendChild(this.webGLRenderer.domElement);

    this.lastRenderTime = Date.now()
    this.webGLRenderer.setAnimationLoop(this.animate);

    this.rootNode = buildJourneyNodes();

    this.rootNode.setRotation(JOURNEY_STARTING_ANGLE);
    this.rootNode.setPosition(JOURNEY_STARTING_POSITION);

    this.addNodesGroupToScene();
  }

  private updateCameraPosition() {
    const curvePoints = [];

    let currentNode = this.rootNode;

    while (currentNode) {
      curvePoints.push(
        new Vector3(0, CAMERA_HEIGHT, 0).add(currentNode.group.position),
      );

      let selectedNodeFound = false;

      for (const childNode of currentNode.children) {
        if (!childNode.selected) {
          continue;
        }

        currentNode = childNode;
        selectedNodeFound = true;
      }

      if (!selectedNodeFound) {
        break;
      }
    }

    const curve = new CatmullRomCurve3(curvePoints, false, "centripetal", 1);
    this.camera.position.copy(curve.getPointAt(this.progress.value % 1));
    this.camera.lookAt(curve.getPointAt((this.progress.value + 0.1) % 1));
  }

  private addNodesGroupToScene() {
    const stack = [this.rootNode];

    while (stack.length) {
      const node = stack.pop() as Node;
      this.scene.add(node.group);
      stack.push(...node.children);
    }
  }

  private animate: XRFrameRequestCallback = () => {
    const deltaTime = Date.now() - this.lastRenderTime
    this.lastRenderTime = Date.now()

    this.progress.tick(deltaTime)

    this.updateCameraPosition();
    this.webGLRenderer.render(this.scene, this.camera);
  };

  public addEventListeners(element: Window | HTMLElement) {
    element.addEventListener("resize", this.resizeEventListener);
    element.addEventListener("wheel", this.scrollEventListener as EventListener, { passive: false});
  }

  public removeEventListeners(element: Window | HTMLElement) {
    element.removeEventListener("resize", this.resizeEventListener);
    element.removeEventListener("wheel", this.scrollEventListener as EventListener);
  }

  private scrollEventListener = (e: WheelEvent) => {
    e.preventDefault()
    this.progress.push(Math.sign(e.deltaY))
  }

  private resizeEventListener = () => {
    const width = this.containerDOMElement.offsetWidth;
    const height = this.containerDOMElement.offsetHeight;

    this.webGLRenderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}
