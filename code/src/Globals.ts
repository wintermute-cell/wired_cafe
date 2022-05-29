import Vector from './Vector';
import Animator from './Animator';
import Scene from './Scene';

export default class Globals {
    // config fields
    static DEBUG: boolean = true;

    // mouse position
    static _currentMousePosition: Vector = new Vector(0, 0);
    static getCurrentMousePos(): Vector {
        return this._currentMousePosition;
    }
    static setCurrentMousePos(pos: Vector): void {
        this._currentMousePosition = pos;
    }

    // animator
    static _activeAnimator: Animator;
    static getActiveAnimator(): Animator {
        return this._activeAnimator;
    }
    static setActiveAnimator(anim: Animator): void {
        this._activeAnimator = anim;
    }

    // scene
    static _activeScene: Scene;
    static getActiveScene(): Scene {
        return this._activeScene;
    }
    static setActiveScene(scene: Scene): void {
        this._activeScene = scene;
    }

}
