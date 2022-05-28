import Vector from './Vector';
import InteractiveObject from './InteractiveObject';

export default interface Scene {
    // the scenes canvas location
    left: number;
    top: number;

    // the size of the actual available screen
    screenWidth: number;
    screenHeight: number;

    // the canvas ctx
    staticCtx: CanvasRenderingContext2D;
    dynamicCtx: CanvasRenderingContext2D;

    staticCanvas: HTMLCanvasElement;
    dynamicCanvas: HTMLCanvasElement;

    // the pixel size of the original scene art
    readonly originalWidth: number;
    readonly originalHeight: number;

    // the size of the scene art after scaling has been applied
    realWidth: number;
    realHeight: number;

    // the factor by which the original art has to be scaled to
    // fill the available screen size.
    sizeFactor: number;

    // an additional scaling factor, that can be used to
    // apply additional scaling
    zoomFactor: number;

    playerObject: DynamicObject;
    dynamicObjects: DynamicObject[];
    interactiveObjects: InteractiveObject[];
    chairZones: InteractiveObject[];

    // this method resizes the entire scene to the given
    // width and height
    resize(width: number, height: number): void;

    handleClick(event: MouseEvent): void;

    handleHover(event: MouseEvent): void;

    getMousePos(event: MouseEvent): Vector;

    isWithinInteractiveObject(position: Vector, iObj: InteractiveObject): boolean;

    // get the mouse position relative to the original scene art size.
    // this position is always the same, regardless of scaling.
    getRelMousePos(event: MouseEvent): Vector;

    // clears the entire canvas
    clearScreen(): void;

    // drawing method for the dynamic layer
    drawStaticLayer(): void;

    // drawing method for the dynamic layer
    drawDynamicLayer(): void;

    // execute the game logic for this frame
    runGameLoop(): void
}
