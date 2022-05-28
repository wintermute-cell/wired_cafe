import Vector from './Vector';

export default class InteractiveObject {
  position: Vector;
  width: number;
  height: number;

  constructor(startingPos: Vector, width: number, height: number) {
    this.position = startingPos;
    this.width = width;
    this.height = height;
  }
}
