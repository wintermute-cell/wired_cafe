import Vector from './Vector';
import Animator from './Animator';

export default class Globals {
    static #currentMousePosition: Vector = new Vector(0, 0);

    static getCurrentMousePos(): Vector {
        return this.#currentMousePosition;
    }
    static setCurrentMousePos(pos: Vector): void {
        this.#currentMousePosition = pos;
    }

    static #activeAnimator: Animator;
    static getActiveAnimator(): Animator {
        return this.#activeAnimator;
    }
    static setActiveAnimator(anim: Animator): void {
        this.#activeAnimator = anim;
    }
}
