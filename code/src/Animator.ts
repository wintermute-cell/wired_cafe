import Scene from 'Scene';

export default class Animator {
  #scene: Scene;
  #lastTime: number;
  #deltaTime: number;
  currTime: number;
  constructor(scene: Scene) {
    this.#scene = scene;
    this.#lastTime = 0;
    this.#deltaTime = 0;
    this.currTime = 0;
  }

  #drawFrame(): void {
    this.#scene.drawStaticLayer();
    this.#scene.drawDynamicLayer();
  }

  getDeltaTime(): number {
      return this.#deltaTime;
  }

  animate(currTime: number) {
    let fixedCurrTime: number;
    if (!currTime) fixedCurrTime = 0;
    else fixedCurrTime = currTime;
    this.currTime = fixedCurrTime;

    this.#deltaTime = (currTime - this.#lastTime) / 1000; // convert milliseconds to second fractions
    this.#lastTime = currTime;

    this.#scene.runGameLoop();
    this.#scene.clearScreen();
    this.#drawFrame();
    requestAnimationFrame(this.animate.bind(this));
  }
}
