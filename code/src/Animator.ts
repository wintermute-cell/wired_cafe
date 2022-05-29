import Scene from './Scene';

export default class Animator {
    _scene: Scene;
    _lastTime: number;
    _deltaTime: number;
    currTime: number = 0;
    constructor(scene: Scene) {
        this._scene = scene;
        this._lastTime = 0;
        this._deltaTime = 0;
    }

    _drawFrame(): void {
        this._scene.drawStaticLayer();
        this._scene.drawDynamicLayer();
    }

    getDeltaTime(): number {
        return this._deltaTime;
    }

    animate(currTime: number = 0) {
        this.currTime = currTime; // make this available for the scene

        this._deltaTime = (currTime - this._lastTime) / 1000; // convert milliseconds to second fractions
        this._lastTime = currTime;

        this._scene.runGameLoop();
        this._scene.clearScreen();
        this._drawFrame();
        requestAnimationFrame(this.animate.bind(this));
    }
}
