import Scene from './Scene';
import Vector from './Vector';
import InteractiveObject from './InteractiveObject';
import Globals from './Globals';

export default class ClassroomScene implements Scene {
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
    readonly originalWidth: number = 684;
    readonly originalHeight: number = 454;

    // the size of the scene art after scaling has been applied
    realWidth: number;
    realHeight: number;

    // the factor by which the original art has to be scaled to
    // fill the available screen size.
    sizeFactor: number;

    // an additional scaling factor, that can be used to
    // apply additional scaling
    zoomFactor: number = 1.1;

    playerObject: DynamicObject;
    dynamicObjects: DynamicObject[] = [];

    // an array containing all InteractiveObjects in the scene
    interactiveObjects: InteractiveObject[] = [];

    chairZones: InteractiveObject[] = [];

    constructor(screenWidth: number, screenHeight: number) {
        this.left = 0;
        this.top = 0;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // calculate factor by which original image height
        // is smaller than screen.
        this.sizeFactor = this.screenHeight / this.originalHeight;

        // adjust size to width if adjusting by height doesn't fill screen.
        if (this.originalWidth * this.sizeFactor < this.screenWidth) {
            this.sizeFactor = this.screenWidth / this.originalWidth;
        }

        this.sizeFactor *= this.zoomFactor; // apply zoom

        // scroll the camera to the center of the scene
        const sc_y: number = (this.originalHeight *
                      this.sizeFactor -
                      this.screenHeight) / 2;
        const sc_x: number = (this.originalWidth *
                      this.sizeFactor -
                      this.screenWidth) / 2;
        setTimeout(() => {
            window.scrollTo(sc_x, sc_y);
        }, 2);

        // apply sizing
        this.realWidth = this.originalWidth * this.sizeFactor;
        this.realHeight = this.originalHeight * this.sizeFactor;

        this.defStaticLayer();
        this.defDynamicLayer();
        this.defGameLogic();
    }

    resize(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;

        // calculate factor by which original image height is smaller than screen.
        this.sizeFactor = this.screenHeight / this.originalHeight;

        // adjust size to width if adjusting by height doesn't fill screen.
        if (this.originalWidth * this.sizeFactor < this.screenWidth) {
            this.sizeFactor = this.screenWidth / this.originalWidth;
        }

        this.sizeFactor *= this.zoomFactor; // apply zoom

        // scroll the camera to the center of the scene
        const sc_y = (this.originalHeight * this.sizeFactor - this.screenHeight) / 2;
        const sc_x = (this.originalWidth * this.sizeFactor - this.screenWidth) / 2;
        setTimeout(() => {
            window.scrollTo(sc_x, sc_y);
        }, 2);

        // apply sizing
        this.realWidth = this.originalWidth * this.sizeFactor;
        this.realHeight = this.originalHeight * this.sizeFactor;

        // TODO: should preferably use the resize methods, but they dont work lol
        this.resizeStaticLayer();
        this.resizeDynamicLayer();
    }

    handleClick(event: MouseEvent) {
        const mousePos: Vector = this.getRelMousePos(event);
        console.log(mousePos);
        let route: any = []; // TODO: replace the entire system lol
        for (let i = 0; i < this.chairZones.length; i++) {
            const chair = this.chairZones[i];
            if (this.isWithinInteractiveObject(mousePos, chair)) {
                switch (i) {
                    case 0:
                        route = [
                        { x: 420, y: 292 },
                        { x: 232, y: 292 },
                        { x: 232, y: 263 },
                    ];
                    break;
                    case 1:
                        route = [
                        { x: 420, y: 292 },
                        { x: 232, y: 292 },
                        { x: 232, y: 231 },
                    ];
                    break;
                    case 2:
                        route = [
                        { x: 420, y: 292 },
                        { x: 232, y: 292 },
                        { x: 232, y: 200 },
                    ];
                    break;
                    case 3:
                        route = [
                        { x: 420, y: 292 },
                        { x: 232, y: 292 },
                        { x: 232, y: 166 },
                    ];
                    break;
                    case 4:
                        route = [
                        { x: 420, y: 292 },
                        { x: 295, y: 292 },
                        { x: 295, y: 263 },
                    ];
                    break;
                    case 5:
                        route = [
                        { x: 420, y: 292 },
                        { x: 295, y: 292 },
                        { x: 295, y: 231 },
                    ];
                    break;
                    case 6:
                        route = [
                        { x: 420, y: 292 },
                        { x: 295, y: 292 },
                        { x: 295, y: 200 },
                    ];
                    break;
                    case 7:
                        route = [
                        { x: 420, y: 292 },
                        { x: 295, y: 292 },
                        { x: 295, y: 166 },
                    ];
                    break;
                    case 8:
                        route = [
                        { x: 420, y: 292 },
                        { x: 360, y: 292 },
                        { x: 360, y: 263 },
                    ];
                    break;
                    case 9:
                        route = [
                        { x: 420, y: 292 },
                        { x: 360, y: 288 },
                        { x: 360, y: 200 },
                    ];
                    break;
                    case 10:
                        route = [
                        { x: 420, y: 292 },
                        { x: 360, y: 292 },
                        { x: 360, y: 200 },
                    ];
                    break;
                    case 11:
                        route = [
                        { x: 420, y: 292 },
                        { x: 360, y: 292 },
                        { x: 360, y: 166 },
                    ];
                    break;
                    default:
                        break;
                }
            }
        }
        if (route.length > 1) {
            this.playerObject.setMovementRoute(route);
            this.playerObject.setMovementSpeed(30);
        }
    }

    handleHover(event: MouseEvent): void {
        gCurrMousePos = this.getRelMousePos(event);
    }

    getMousePos(event: MouseEvent): Vector {
        return new Vector(event.offsetX, event.offsetY);
    }

    // returns true if the (relative) coordinates are within the given zone.
    isWithinInteractiveObject(pos: Vector, iObj: InteractiveObject): boolean {
        if (pos.x > iObj.position.x && pos.x < iObj.position.x + iObj.width) {
            if (pos.y > iObj.position.y && pos.y < iObj.position.y + iObj.height) {
                return true;
            }
        }
        return false;
    }

    getRelMousePos(event: MouseEvent): Vector {
        const pos = new Vector(
            event.offsetX,
            event.offsetY
        );
        return pos
    }

    clearScreen(): void {
        this.staticCtx.clearRect(0, 0, this.realWidth, this.realHeight);
        this.dynamicCtx.clearRect(0, 0, this.realWidth, this.realHeight);
    }

    defStaticLayer(): void {
        // get canvas
        const staCanvas: HTMLElement|null = document.getElementById('layer1');
        if(staCanvas) this.staticCanvas = staCanvas as HTMLCanvasElement;
        else throw new TypeError("Static canvas element was null!")

        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;

        // get ctx
        const ctx: CanvasRenderingContext2D|null =
            this.staticCanvas.getContext('2d');
        if(ctx) this.staticCtx = ctx as CanvasRenderingContext2D;
        else throw new TypeError("Static context was null!")

        // disable smoothing out pixels
        this.dynamicCtx.imageSmoothingEnabled = false;
    }

    private resizeStaticLayer() {
        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;
    }

    drawStaticLayer(): void {
        const ctx = this.staticCtx;
        const render = new Image();
        render.src = ClassroomRender;
        ctx.drawImage(render, this.left, this.top, this.realWidth, this.realHeight);
    }

    private defDynamicLayer(): void {
        // get canvas
        const dynCanvas: HTMLElement|null = document.getElementById('layer2');
        if(dynCanvas) this.dynamicCanvas = dynCanvas as HTMLCanvasElement;
        else throw new TypeError("Dynamic canvas element was null!")

        this.dynamicCanvas.width = this.realWidth;
        this.dynamicCanvas.height = this.realHeight;

        // register interaction events
        this.dynamicCanvas.onclick = this.handleClick.bind(this);
        this.dynamicCanvas.addEventListener('mousemove', (e) => {
            this.handleHover(e);
        });

        // get ctx
        const ctx: CanvasRenderingContext2D|null =
            this.dynamicCanvas.getContext('2d');
        if(ctx) this.dynamicCtx = ctx as CanvasRenderingContext2D;
        else throw new TypeError("Dynamic context was null!")

        // disable smoothing out pixels
        this.dynamicCtx.imageSmoothingEnabled = false;
    }

    private resizeDynamicLayer(): void {
        this.dynamicCanvas.width = this.realWidth;
        this.dynamicCanvas.height = this.realHeight;
    }

    drawDynamicLayer() {
        const ctx = this.dynamicCtx;

         // this has to be done two times so i packaged it in a func
        function drawDynObj(scene: Scene): void {
            for (const dynObj of scene.dynamicObjects) {
                dynObj.draw(ctx, scene);
            }
        }

        const light = new Image();
        light.src = ClassroomLight;
        drawDynObj(this);
        ctx.globalCompositeOperation = 'soft-light';
        ctx.drawImage(light, this.left, this.top, this.realWidth, this.realHeight);
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(light, this.left, this.top, this.realWidth, this.realHeight);
        ctx.globalCompositeOperation = 'destination-atop';
        drawDynObj(this);

        if (gDEBUG) {
            ctx.globalCompositeOperation = 'source-over';
            for (const iObj of this.interactiveObjects) {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'yellow';

                // mark hovered objects in red
                const currMousePos: Vector = Globals.getCurrentMousePos();
                if (this.isWithinInteractiveObject(currMousePos,iObj))
                    ctx.strokeStyle = 'red';

                ctx.rect(
                    iObj.position.x * this.sizeFactor,
                    iObj.position.y * this.sizeFactor,
                    iObj.width * this.sizeFactor,
                    iObj.height * this.sizeFactor);
                ctx.stroke();
            }
        }
    }

    defGameLogic(): void {
        // get sprite
        const userCharacterSprite: HTMLImageElement = new Image();
        userCharacterSprite.src = Femalestudentwalkingeast;

        // make object
        const userCharacter: DynamicObject =
            new DynamicObject(32, 32, userCharacterSprite, 8, 5.5);
        userCharacter.setPos(400, 400);
        userCharacter.setSprites(
            [Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast],
            [Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast],
        );

        this.playerObject = userCharacter;
        this.dynamicObjects.push(userCharacter);

        // define chair zones
        // for each chair: [upper-left], width, height
        const chairZones: Array<[Vector, number, number]> = [
            // back (3th) row
            [new Vector(246, 237), 34, 30],
            [new Vector(246, 204), 34, 30],
            [new Vector(246, 174), 34, 30],
            [new Vector(246, 142), 34, 30],
            // 2d row
            [new Vector(310, 237), 34, 30],
            [new Vector(310, 204), 34, 30],
            [new Vector(310, 174), 34, 30],
            [new Vector(310, 142), 34, 30],
            // 1st row
            [new Vector(374, 237), 34, 30],
            [new Vector(374, 204), 34, 30],
            [new Vector(374, 174), 34, 30],
            [new Vector(374, 142), 34, 30],
        ];
        for (const zone of chairZones)
            this.interactiveObjects.push(
                new InteractiveObject(
                    zone[0],
                    zone[1],
                    zone[2]));
        for (const zone of chairZones)
            this.chairZones.push(
                new InteractiveObject(
                    zone[0],
                    zone[1],
                    zone[2]));
    }

    runGameLoop(): void {
        for (const o of this.dynamicObjects) {
            o.moveOnRoute();
        }
    }
}
