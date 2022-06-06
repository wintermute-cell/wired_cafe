import Scene from './Scene';
import Vector from './Vector';
import InteractiveObject from './InteractiveObject';
import Globals from './Globals';
import DynamicObject from './DynamicObject';
import AnimationMode from './AnimationMode';
import Helper from './Helper';
import RouteGraph from './RouteGraph';
import RouteNode from './RouteNode';

// resource paths
// classroom
const ClassroomRender: string =
    '/resources/scenes/classroom/ClassroomRender.png';
const ClassroomLight: string =
    '/resources/scenes/classroom/ClassroomLight.png';

// female student
const Femalestudentwalkingeast: string = '../resources/characters/female_student/Femalestudentwalkingeast-sheet.png';
const Femalestudentwalkingnorth: string = '../resources/characters/female_student/Femalestudentwalkingnorth-sheet.png';
const Femalestudentwalkingsouth: string = '../resources/characters/female_student/Femalestudentwalkingsouth-sheet.png';
const Femalestudentwalkingwest: string = '../resources/characters/female_student/Femalestudentwalkingwest-sheet.png';

const Femalestudentsitting: string = '../resources/characters/female_student/Femalestudentsitting.png'


export default class ClassroomScene implements Scene {
    // the scenes canvas location
    left: number;
    top: number;

    // the size of the actual available screen
    screenWidth: number;
    screenHeight: number;

    // the canvas ctx
    staticCtx!: CanvasRenderingContext2D;
    dynamicCtx!: CanvasRenderingContext2D;

    staticCanvas!: HTMLCanvasElement;
    dynamicCanvas!: HTMLCanvasElement;

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

    playerObject!: DynamicObject;
    dynamicObjects: DynamicObject[] = [];

    // an array containing all InteractiveObjects in the scene
    interactiveObjects: InteractiveObject[] = [];

    chairZones: InteractiveObject[] = [];

    routeGraph!: RouteGraph;

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
        if (Globals.DEBUG) console.log(mousePos);
        for (let i = 0; i < this.chairZones.length; i++) {
            const chair = this.chairZones[i];
            if (this.isWithinInteractiveObject(mousePos, chair)) {
                console.log('in chair');
                if (true) { // TODO: if server says the seat is empty
                    this.playerObject.setMovementRoute(
                        this.routeGraph.getRoute(
                            this.playerObject.routePosition, this.routeGraph.getClosestNodeTo(chair.position)
                        )
                    )
                }
                break // no need to look at the other chairs
            }
        }
    }

    handleHover(event: MouseEvent): void {
        Globals.setCurrentMousePos(this.getRelMousePos(event));
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
            event.offsetX / this.sizeFactor,
            event.offsetY / this.sizeFactor
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
        this.staticCtx.imageSmoothingEnabled = false;
    }

    private resizeStaticLayer() {
        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;

        // the ctx has to be fetched again, otherwise the image will get blurry for some reason.
        // get ctx
        const ctx: CanvasRenderingContext2D|null =
            this.staticCanvas.getContext('2d');
        if(ctx) this.staticCtx = ctx as CanvasRenderingContext2D;
        else throw new TypeError("Static context was null!")

        // disable smoothing out pixels
        this.staticCtx.imageSmoothingEnabled = false;
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

        // the ctx has to be fetched again, otherwise the image will get blurry for some reason.
        // get ctx
        const ctx: CanvasRenderingContext2D|null =
            this.dynamicCanvas.getContext('2d');
        if(ctx) this.dynamicCtx = ctx as CanvasRenderingContext2D;
        else throw new TypeError("Dynamic context was null!")

        // disable smoothing out pixels
        this.dynamicCtx.imageSmoothingEnabled = false;
    }

    drawDynamicLayer() {
        const ctx = this.dynamicCtx;

         // this has to be done two times so i packaged it in a func
        function drawDynObj(scene: Scene): void {
            scene.dynamicObjects.sort((a, b) => (a.position.y > b.position.y) ? 1 : -1) // render lower positions in front
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

        if (Globals.DEBUG) {
            ctx.globalCompositeOperation = 'source-over';
            // draw interactives
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

            // draw route graph
            for (const node of this.routeGraph.nodes) {
                // draw paths to neighburs
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'green';
                for (const n of node.neighbours) {
                    ctx.beginPath();
                    ctx.moveTo(node.position.x * this.sizeFactor, node.position.y * this.sizeFactor);
                    ctx.lineTo(n.position.x * this.sizeFactor, n.position.y * this.sizeFactor);
                    ctx.stroke();
                }

                // draw nodes
                ctx.beginPath();
                ctx.fillStyle = 'green';

                ctx.fillRect(
                    (node.position.x * this.sizeFactor) - 3 * this.sizeFactor,
                    node.position.y * this.sizeFactor - 3 * this.sizeFactor,
                    6 * this.sizeFactor,
                    6 * this.sizeFactor);
                ctx.stroke();
            }

            // draw dynamics
            for (const dynObj of this.dynamicObjects) {
                ctx.beginPath();
                ctx.fillStyle = 'blue';

                const p: Vector = dynObj.getPos();
                ctx.fillRect(
                    p.x * this.sizeFactor,
                    p.y * this.sizeFactor,
                    3 * this.sizeFactor,
                    3 * this.sizeFactor);
                ctx.stroke();

                // draw routing information
                for (let i = 0, len = dynObj.movementRoute.length;  i < len;  i++) {
                    const node = dynObj.movementRoute[i];
                    ctx.beginPath();
                    ctx.fillStyle = 'purple';

                    ctx.fillRect(
                        node.position.x * this.sizeFactor,
                        node.position.y * this.sizeFactor,
                        4 * this.sizeFactor,
                        4 * this.sizeFactor);
                    ctx.stroke();

                    const nextNode = dynObj.movementRoute[i+1];
                    ctx.strokeStyle = 'purple';
                    if (nextNode === dynObj.routePosition) ctx.strokeStyle = 'lightblue';
                    ctx.lineWidth = 2;
                    if (nextNode) {
                        ctx.beginPath();
                        ctx.moveTo(node.position.x * this.sizeFactor, node.position.y * this.sizeFactor);
                        ctx.lineTo(nextNode.position.x * this.sizeFactor, nextNode.position.y * this.sizeFactor);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    createRouteGraph() {
        const nodes: RouteNode[] = [];

        // create new node and add to list
        function nn(x: number, y: number): RouteNode {
            let n: RouteNode = new RouteNode(x, y);
            nodes.push(n)
            return n
        }

        // bottom of screen, door and below rows
        let at_door = nn(418, 286);
        let below_first_row = nn(358, 286);
        at_door.addBidNeighbour(below_first_row);

        let below_sec_row = nn(294, 286);
        below_first_row.addBidNeighbour(below_sec_row);

        let below_thrd_row = nn(230, 286);
        below_sec_row.addBidNeighbour(below_thrd_row);

        // first row
        let fr_first = nn(358, 263);
        let fr_sec = nn(358, 231);
        let fr_thrd = nn(358, 199);
        let fr_frth = nn(358, 167);
        below_first_row.addBidNeighbour(fr_first);
        fr_first.addBidNeighbour(fr_sec);
        fr_sec.addBidNeighbour(fr_thrd);
        fr_thrd.addBidNeighbour(fr_frth);

        // second row
        let sc_first = nn(294, 263);
        let sc_sec = nn(294, 231);
        let sc_thrd = nn(294, 199);
        let sc_frth = nn(294, 167);
        below_sec_row.addBidNeighbour(sc_first);
        sc_first.addBidNeighbour(sc_sec);
        sc_sec.addBidNeighbour(sc_thrd);
        sc_thrd.addBidNeighbour(sc_frth);

        // third row
        let th_first = nn(230, 263);
        let th_sec = nn(230, 231);
        let th_thrd = nn(230, 199);
        let th_frth = nn(230, 167);
        below_thrd_row.addBidNeighbour(th_first);
        th_first.addBidNeighbour(th_sec);
        th_sec.addBidNeighbour(th_thrd);
        th_thrd.addBidNeighbour(th_frth);

        // add all the nodes to the scenes graph
        this.routeGraph = new RouteGraph(nodes);
    }

    createPlayer() {
        // get sprite
        const userCharacterSprite: HTMLImageElement = new Image();
        userCharacterSprite.src = Femalestudentwalkingeast;

        const userCharacter: DynamicObject = new DynamicObject(32, 32, userCharacterSprite, this.routeGraph.nodes[0]);
        userCharacter.setMovementSpeed(30);
        userCharacter.addAnimationMode('walking',
            new AnimationMode(
                Helper.PathsToImgs([Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast]),
                8, 5.5
            )
        );
        userCharacter.addAnimationMode('idle',
            new AnimationMode( // TODO: put actual idle animations here goddamn
                Helper.PathsToImgs([Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast]),
                8, 5.5
            )
        );
        userCharacter.addAnimationMode('sitting',
            new AnimationMode( // TODO: make directional sitting animations
                Helper.PathsToImgs([Femalestudentsitting, Femalestudentsitting, Femalestudentsitting, Femalestudentsitting]),
                1, 0
            )
        );

        this.playerObject = userCharacter;
        this.dynamicObjects.push(userCharacter);
    }

    defGameLogic(): void {
        this.createRouteGraph();
        this.createPlayer();
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
