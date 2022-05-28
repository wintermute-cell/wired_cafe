import Globals from './Globals';
import Vector from './Vector';
import Scene from './Scene';

class DynamicObject {
  height: number;
  width: number;

  sprite: HTMLImageElement;

  // N, W, S, E
  spritesIdle: [
      HTMLImageElement,
      HTMLImageElement,
      HTMLImageElement,
      HTMLImageElement];

  // N, W, S, E
  spritesWalk: [
      HTMLImageElement,
      HTMLImageElement,
      HTMLImageElement,
      HTMLImageElement];

  position: Vector; // current x, y position

  movementRoute: Vector[] = []; // a list of x, y position objects
  positionOnRoute: number; // an index of the current position in the above route
  movementSpeed: number;
  distToNextPoint: number;

  animationStep: number = 0; // current animation frame of the sprite-sheet
  animationFrames: number; // total amount of animation frames in sprite-sheet
  animationSpeed: number; // animation frames per second

  // this is used to check when the animate method was last called
  // to prevent double animation calls in one frame
  lastTime: number = 0;

  constructor(height, width, sprite, animationFrames, animationSpeed) {
    this.height = height;
    this.width = width;
    this.sprite = sprite;
    this.animationFrames = animationFrames;
    this.animationSpeed = animationSpeed;
    this.position = new Vector(0, 0);
    this.movementSpeed = 0;
  }

  setSprites(idleSpritePaths: string[], walkSpritePaths: string[]) {
    this.spritesIdle = [new Image(), new Image(), new Image(), new Image()];
    for (let i = 0, len = this.spritesIdle.length; i < len; i++) {
        this.spritesIdle[i].src = idleSpritePaths[i];
    }
    this.spritesWalk = [new Image(), new Image(), new Image(), new Image()];
    for (let i = 0, len = this.spritesWalk.length; i < len; i++) {
        this.spritesWalk[i].src = walkSpritePaths[i];
    }
  }

  setMovementRoute(route: Vector[]) {
    // adjust route points for object size
    const adjustedRoute = route.map((pos: Vector) => {
      const adjustedPos: Vector = pos;
      adjustedPos.x -= this.width / 2;
      adjustedPos.y -= this.height;
      return adjustedPos;
    });
    this.movementRoute = adjustedRoute;
    this.positionOnRoute = 0;
    const firstPoint = route[0];
    this.setPos(firstPoint.x, firstPoint.y);
    this.distToNextPoint = distVectors(firstPoint, route[1]);
  }

  setMovementSpeed(speed: number): void {
    this.movementSpeed = speed;
  }

  setPos(x: number, y: number): void {
    this.position = new Vector(x, y);
  }

  selectSprite(direction: Vector): void {
    if (direction.x === 0 && direction.y === 0) {
      this.sprite = this.spritesIdle[2];
    } else if (Math.abs(direction.x) > Math.abs(direction.y)) {
      // horizontal movement is stronger
      if (direction.x > 0) this.sprite = this.spritesWalk[3];
      else this.sprite = this.spritesWalk[1];
    } else {
      // vertical movement is stronger
      if (direction.y > 0) this.sprite = this.spritesWalk[2];
      else this.sprite = this.spritesWalk[0];
    }
  }

  moveOnRoute(): void {
    if (this.positionOnRoute < this.movementRoute.length - 1) {
      const target: Vector = this.movementRoute[this.positionOnRoute + 1];
      const direction = new Vector(
        target.x - this.position.x,
        target.y - this.position.y,
      );

      this.selectSprite(direction);

      // normalizing the direction vector
      const normDirection: Vector = direction.normalized();

      // this will be used a couple times, so make is short
      const deltaTime = Globals.getActiveAnimator().deltaTime;
      // check if route point already reached
      this.distToNextPoint -=
          this.movementSpeed * deltaTime;

      if (this.distToNextPoint < 0) {
        this.setPos(target.x, target.y);
        this.positionOnRoute += 1;
        // only calculate the next distance only if the end hasn't
        // been reached yet.
        if (this.positionOnRoute < this.movementRoute.length - 1) {
          this.distToNextPoint = distVectors(
            this.position,
            this.movementRoute[this.positionOnRoute + 1],
          );
        }
      } else {
        this.setPos(
          this.position.x + normDirection.x * deltaTime * this.movementSpeed,
          this.position.y + normDirection.y * deltaTime * this.movementSpeed,
        );
      }
    } else {
      // if not moving, do...
      this.selectSprite(new Vector(0, 0));
    }
  }

  animate(): void {
    // prevent animation from progressing multiple times each frame
    // if the obj is rendered multiple times by comparing the last timestamp with the current one
    if (this.lastTime !== Globals.getActiveAnimator().currTime) {
      this.animationStep +=
          Globals.getActiveAnimator().deltaTime * this.animationSpeed;
      if (this.animationStep > this.animationFrames) this.animationStep = 0;
    }
    this.lastTime = Globals.getActiveAnimator().currTime;
  }

  draw(ctx: CanvasRenderingContext2D, scene: Scene): void {
    ctx.drawImage(
      this.sprite,
      Math.floor(this.animationStep) * this.width, 0,
      32, 32,
      this.position.x * scene.sizeFactor,
      this.position.y * scene.sizeFactor,
      this.height * scene.sizeFactor,
      this.width * scene.sizeFactor,
    );
    this.animate();
  }
}
