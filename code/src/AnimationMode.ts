export default class AnimationMode {
    // N, W, S, E
    spriteSets: HTMLImageElement[];

    currDirection: number = 2; // default south facing

    animationStep: number = 0; // current animation frame of the sprite-sheet
    animationFrames: number; // total amount of animation frames in sprite-sheet
    animationSpeed: number; // animation frames per second

    constructor(
        spriteSets: HTMLImageElement[],
        animationFrames: number, animationSpeed: number) {
        this.spriteSets = spriteSets;
        this.animationFrames = animationFrames;
        this.animationSpeed = animationSpeed;
    }
}
