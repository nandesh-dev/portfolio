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
  CAMERA_HEIGHT = 20;

const JOURNEY_STARTING_POSITION = Object.freeze(new Vector3(0, 0, 0)),
  JOURNEY_STARTING_ANGLE = 0;

const NODE_SIZE = 32;

interface NodeObject {
  setProgress(progress: number): void;
}

class Node {
  public relativeAngle: number;
  public objects: (Object3D & NodeObject)[];
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
    this.objects = objects;
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
    this.value = initialValue;
    this.velocity = 0;
  }

  tick(deltaTime: number) {
    const RESISTANCE = 0.002;

    this.value += deltaTime * this.velocity;
    this.velocity -= deltaTime * RESISTANCE * this.velocity;

    this.value = Math.max(0, this.value);
  }

  push(force: number) {
    const FORCE_CONSTANT = 0.000003;
    this.velocity += force * FORCE_CONSTANT;
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
  private touchStartY: number;

  constructor(containerDOMElement: HTMLElement) {
    this.containerDOMElement = containerDOMElement;

    this.progress = new Progress(0);
    this.touchStartY = 0;

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

    this.lastRenderTime = Date.now();
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

    const k = Math.min(1, this.progress.value / curvePoints.length);

    this.camera.position.copy(curve.getPointAt(k % 1));
    this.camera.lookAt(curve.getPointAt((k + 0.1) % 1));
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
    const deltaTime = Date.now() - this.lastRenderTime;
    this.lastRenderTime = Date.now();

    this.progress.tick(deltaTime);
    this.updateObjectsProgress();

    this.updateCameraPosition();
    this.webGLRenderer.render(this.scene, this.camera);
  };

  private updateObjectsProgress(
    value: number = this.progress.value,
    node: Node = this.rootNode,
  ) {
    for (const object of node.objects) {
      object.setProgress(value);
    }

    for (const child of node.children) {
      this.updateObjectsProgress(value - 1, child);
    }
  }

  public addEventListeners(element: Window | HTMLElement) {
    element.addEventListener("resize", this.resizeEventListener, {
      passive: true,
    });
    element.addEventListener(
      "wheel",
      this.wheelEventListener as EventListener,
      { passive: false },
    );
    element.addEventListener(
      "touchstart",
      this.touchStartEventListener as EventListener,
      { passive: false },
    );
    element.addEventListener(
      "touchmove",
      this.touchMoveEventListener as EventListener,
      { passive: false },
    );
  }

  public removeEventListeners(element: Window | HTMLElement) {
    element.removeEventListener("resize", this.resizeEventListener);
    element.removeEventListener(
      "wheel",
      this.wheelEventListener as EventListener,
    );
  }

  private touchStartEventListener = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length < 1) return;
    this.touchStartY = e.touches[0].clientY;
  };

  private touchMoveEventListener = (e: TouchEvent) => {
    const MULTIPLIER = 5;

    e.preventDefault();
    if (e.touches.length < 1) return;
    const deltaY = -(e.touches[0].clientY - this.touchStartY) * MULTIPLIER;

    this.progress.push(deltaY);

    this.touchStartY = e.touches[0].clientY;
  };

  private wheelEventListener = (e: WheelEvent) => {
    e.preventDefault();
    this.progress.push(e.deltaY);
  };

  private resizeEventListener = () => {
    const width = this.containerDOMElement.offsetWidth;
    const height = this.containerDOMElement.offsetHeight;

    this.webGLRenderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}
