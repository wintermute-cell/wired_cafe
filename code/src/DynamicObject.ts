import Globals from './Globals';
import Vector from './Vector';
import WVector from './WVector';
import Scene from './Scene';
import AnimationMode from './AnimationMode';
import RouteNode from './RouteNode';

export default class DynamicObject {

  height: number;
  width: number;

  sprite: HTMLImageElement;

  currAnimationMode!: AnimationMode;
  animationModes: { [key: string]: AnimationMode } = {};

  spriteSitting!: HTMLImageElement;

  position!: WVector; // current x, y position
  routePosition: RouteNode;

  movementRoute: RouteNode[] = []; // a list of x, y position objects
  stepOfRoute: number = 0; // an index of the current position in the above route
  movementSpeed: number;
  distToNextPoint: number = 0;

  // this is used to check when the animate method was last called
  // to prevent double animation calls in one frame
  lastTime: number = 0;

  constructor(height: number,
              width: number,
              sprite: HTMLImageElement,
              routePosition: RouteNode) {
    this.height = height;
    this.width = width;
    this.sprite = sprite;
    this.routePosition = routePosition;
    this.setPos(routePosition.position.x, routePosition.position.y)
    this.movementSpeed = 0;
  }

  addAnimationMode(name: string, mode: AnimationMode) {
    if (!this.currAnimationMode) this.currAnimationMode = mode; // the first assigned animation mode becomes the initial mode
    this.animationModes[name] = mode;
  }

  setMovementRoute(route: RouteNode[]) {
    if (route.length > 0) {
      this.movementRoute = route;
      this.stepOfRoute = 0;
      this.distToNextPoint = this.position.distanceTo(route[1].position);
      this.routePosition = route[1];
    }
  }

  setMovementSpeed(speed: number): void {
    this.movementSpeed = speed;
  }

  setPos(x: number, y: number): void {
    const adjustedPos: Vector = new Vector(x, y);
    adjustedPos.x -= this.width / 2;
    adjustedPos.y -= this.height;
    this.position = adjustedPos;
  }

  getPos(): Vector {
    const p = new Vector(this.position.x, this.position.y);
    p.x += this.width / 2;
    p.y += this.height;
    return p
  }

  selectSprite(direction: Vector): void {
    //if (direction.x === 0 && direction.y === 0) {
    //  this.sprite = this.spritesIdle[2];
    //} else if (Math.abs(direction.x) > Math.abs(direction.y)) {
    //  // horizontal movement is stronger
    //  if (direction.x > 0) this.sprite = this.spritesWalk[3];
    //  else this.sprite = this.spritesWalk[1];
    //} else {
    //  // vertical movement is stronger
    //  if (direction.y > 0) this.sprite = this.spritesWalk[2];
    //  else this.sprite = this.spritesWalk[0];
    //}
  }

  moveOnRoute(): void {
    // if the end of the route has been reached, no movement is required. instead, clear the current route
    if (this.stepOfRoute >= this.movementRoute.length-1) {
      this.stepOfRoute = 0;
      this.movementRoute = []
      return;
    } else {
      const deltaTime: number = Globals.getActiveAnimator().getDeltaTime(); // will be used a couple of times, so short name is better
      const target: WVector = this.movementRoute[this.stepOfRoute + 1].position;  // the current next node in the route

      // check if the next step would reach the target
      const lookAheadDistance = this.distToNextPoint - (this.movementSpeed * deltaTime);
      if (lookAheadDistance <= 0) {
        this.setPos(target.x, target.y);
        this.stepOfRoute++;

        // prepare for the next part of the route
        if (this.stepOfRoute < this.movementRoute.length - 1) {
          this.routePosition = this.movementRoute[this.stepOfRoute+1]; // the route position is always the target of the walk
          this.distToNextPoint = this.position.distanceTo(this.routePosition.position);
        }
        return
      } else {
        // since this step will not reach the target, just move as expected
        const currPos: WVector = this.getPos();
        const direction = new Vector(
          target.x - currPos.x,
          target.y - currPos.y,
        );

      // normalizing the direction vector
      const nDirection: Vector = direction.normalized();
        // if the route point has not been reached
        const p: WVector = this.getPos();
        this.setPos(
          p.x + nDirection.x * deltaTime * this.movementSpeed,
          p.y + nDirection.y * deltaTime * this.movementSpeed,
        );
        this.distToNextPoint = p.distanceTo(target);
      }
    }
  }

  animate(): void {
    if (Object.keys(this.animationModes).length <= 0) {
      console.log("Tried to animate dynamic object without any assigned animationModes!")
      return
    }
    // prevent animation from progressing multiple times each frame
    // if the obj is rendered multiple times by comparing the last timestamp with the current one
    if (this.lastTime !== Globals.getActiveAnimator().currTime) {
      this.currAnimationMode.animationStep +=
          Globals.getActiveAnimator().getDeltaTime() * this.currAnimationMode.animationSpeed;
      if (this.currAnimationMode.animationStep > this.currAnimationMode.animationFrames) this.currAnimationMode.animationStep = 0;
    }
    this.lastTime = Globals.getActiveAnimator().currTime;
  }

  draw(ctx: CanvasRenderingContext2D, scene: Scene): void {
    ctx.drawImage(
      this.sprite,
      Math.floor(this.currAnimationMode.animationStep) * this.width, 0,
      32, 32,
      this.position.x * scene.sizeFactor,
      this.position.y * scene.sizeFactor,
      this.height * scene.sizeFactor,
      this.width * scene.sizeFactor,
    );
    this.animate();
  }
}
