// resource imports
// classroom
let ClassroomRender = "/resources/scenes/classroom/ClassroomRender.png"
let ClassroomLight = "/resources/scenes/classroom/ClassroomLight.png"
// female student
let Femalestudentwalkingeast = "/resources/characters/female_student/Femalestudentwalkingeast-sheet.png"
let Femalestudentwalkingnorth = "/resources/characters/female_student/Femalestudentwalkingnorth-sheet.png"
let Femalestudentwalkingsouth = "../resources/characters/female_student/Femalestudentwalkingsouth-sheet.png"
let Femalestudentwalkingwest = "../resources/characters/female_student/Femalestudentwalkingwest-sheet.png"


// global constants
const g_DEBUG = true;


// global variables
let g_currMousePos = {x: 0, y: 0};
let g_activeScene = null;
let g_activeAnimator = null;


window.onload = function () {
    g_activeScene = new ClassroomScene(window.innerWidth, window.innerHeight);
    g_activeAnimator = new Animator(g_activeScene);
    g_activeAnimator.animate();
};

window.addEventListener("resize", function() {
    if (g_activeScene != null) {
        g_activeScene.resize(window.innerWidth, window.innerHeight);
    }
});

// some vector helper functions
function addVectors(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

function distVectors(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}


// an object that can be moved around
class DynamicObject {
    height;
    width;

    sprite;
    spriteIdleN;
    spriteIdleW;
    spriteIdleS;
    spriteIdleE;
    spriteWalkN;
    spriteWalkW;
    spriteWalkS;
    spriteWalkE;
    sprite

    position; // current x, y position
    movementRoute; // a list of x, y position objects
    positionOnRoute; // an index of the current position in the above route
    movementSpeed;
    distToNextPoint;

    animationStep = 0; // the current animation frame of the sprite-sheet
    animationFrames; // total amount of animation frames in the sprite-sheet
    animationSpeed; // animation frames per second

    lastTime;

    constructor(height, width, sprite, animationFrames, animationSpeed) {
        this.height = height;
        this.width = width;
        this.sprite = sprite;
        this.animationFrames = animationFrames;
        this.animationSpeed = animationSpeed;
        this.movementRoute = [{x: 0, y: 0}];
        this.position = {x: 0, y: 0};
        this.movementSpeed = 0;
    }


    setSprites(idleSprites, walkSprites) {
        this.spriteIdleN = new Image();
        this.spriteIdleN.src = idleSprites[0];
        this.spriteIdleW = new Image();
        this.spriteIdleW.src = idleSprites[1];
        this.spriteIdleS = new Image();
        this.spriteIdleS.src = idleSprites[2];
        this.spriteIdleE = new Image();
        this.spriteIdleE.src = idleSprites[3];
        this.spriteWalkN = new Image();
        this.spriteWalkN.src = walkSprites[0];
        this.spriteWalkW = new Image();
        this.spriteWalkW.src = walkSprites[1];
        this.spriteWalkS = new Image();
        this.spriteWalkS.src = walkSprites[2];
        this.spriteWalkE = new Image();
        this.spriteWalkE.src = walkSprites[3];
    }

    setMovementRoute(route) {
        // adjust route points for object size
        route = route.map(pos => {
            pos.x = pos.x-this.width/2;
            pos.y = pos.y-this.height;
            return pos
        });
        this.movementRoute = route;
        this.positionOnRoute = 0;
        let firstPoint = route[0];
        this.setPos(firstPoint.x, firstPoint.y);
        this.distToNextPoint = distVectors(firstPoint, route[1]);
    }

    setMovementSpeed(speed) {
        this.movementSpeed = speed;
    }

    setPos(x, y) {
        this.position = {x: x, y: y};
    }

    selectSprite(direction) {
        if (direction.x === 0 && direction.y === 0){
            this.sprite = this.spriteIdleS;
        }
        else {
            if (Math.abs(direction.x) > Math.abs(direction.y)) {
                // horizontal movement is stronger
                if (direction.x > 0) { this.sprite = this.spriteWalkE; }
                else { this.sprite = this.spriteWalkW }
            }
            else {
                // vertical movement is stronger
                if (direction.y > 0) { this.sprite = this.spriteWalkS; }
                else { this.sprite = this.spriteWalkN; }
            }
        }
    }

    moveOnRoute() {
        if (this.positionOnRoute < this.movementRoute.length-1) {
            let target = this.movementRoute[this.positionOnRoute+1]
            let direction = {
                x: target.x - this.position.x,
                y: target.y - this.position.y
            };

            this.selectSprite(direction);

            // normalizing the direction vector
            let directionLen = Math.sqrt(
                direction.x*direction.x + direction.y*direction.y
            );
            let normDirection;
            if (directionLen !== 0) {
                normDirection = {
                    x: direction.x / directionLen,
                    y: direction.y / directionLen
                };
            }
            else {
                normDirection = {x: 0, y: 0};
            }
            // check if route point already reached
            this.distToNextPoint -= this.movementSpeed * g_activeAnimator.deltaTime;
            if (this.distToNextPoint < 0) {
                this.setPos(target.x, target.y);
                this.positionOnRoute += 1;
                // only calculate the next distance only if the end hasn't
                // been reached yet.
                if (this.positionOnRoute < this.movementRoute.length-1) {
                    this.distToNextPoint = distVectors(
                        this.position,
                        this.movementRoute[this.positionOnRoute+1]);
                }
            }
            // if not, move
            else {
                this.setPos(
                    this.position.x + normDirection.x * g_activeAnimator.deltaTime * this.movementSpeed,
                    this.position.y + normDirection.y * g_activeAnimator.deltaTime * this.movementSpeed
                );
            }
        }
        else {
            // if not moving, do...
            this.selectSprite({x: 0, y: 0});
        }
    }

    animate() {
        // prevent animation from progressing multiple times each frame
        // if the obj is rendered multiple times by comparing the last timestamp with the current one
        if (this.lastTime !== g_activeAnimator.currTime) {
            this.animationStep += g_activeAnimator.deltaTime * this.animationSpeed;
            if (this.animationStep > this.animationFrames) this.animationStep = 0;
        }
        this.lastTime = g_activeAnimator.currTime;
    }

    draw(ctx, scene) {
        ctx.drawImage(
            this.sprite,
            Math.floor(this.animationStep)*this.width, 0, 32, 32,
            this.position.x * scene.sizeFactor,
            this.position.y * scene.sizeFactor,
            this.height * scene.sizeFactor,
            this.width * scene.sizeFactor
        );
        this.animate();
    }
}

// an object that can be interacted with (must be stationary)
// (basically just a collider, the sprite has to be drawn separately)
class InteractiveObject {
    position;
    width;
    height;
    constructor(x, y, width, height){
        this.position = {x: x, y: y};
        this.width = width;
        this.height = height;
    }
}

class ClassroomScene {
    left = 0;
    top = 0;

    screenWidth;
    screenHeight;

    staticCtx;
    dynamicCtx;

    originalWidth = 684;
    originalHeight = 454;
    realWidth;
    realHeight;

    sizeFactor;
    zoomFactor = 1.1;

    staticCanvas;
    dynamicCanvas;

    playerObject;
    dynamicObjects = [];
    interactiveObjects = [];
    chairZones = [];

    constructor(width, height) {
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
        let sc_y = (this.originalHeight*this.sizeFactor - this.screenHeight) / 2;
        let sc_x = (this.originalWidth*this.sizeFactor - this.screenWidth) / 2;
        setTimeout(function () {
            window.scrollTo(sc_x, sc_y);
        },2);

        // apply sizing
        this.realWidth = this.originalWidth * this.sizeFactor;
        this.realHeight = this.originalHeight * this.sizeFactor;

        this.defStaticLayer();
        this.defDynamicLayer();

        this.dynamicCanvas.onclick = this.handleClick.bind(this);
        this.dynamicCanvas.addEventListener("mousemove", (e) => {
            this.handleHover(e);
        });

        let userCharacterSprite = new Image();
        userCharacterSprite.src = Femalestudentwalkingeast;
        let userCharacter = new DynamicObject(32, 32, userCharacterSprite, 8, 5.5);
        userCharacter.setPos(400, 400);
        userCharacter.setSprites(
            [Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast],
            [Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast]);
        this.dynamicObjects.push(userCharacter);
        this.playerObject= userCharacter;

        // for each chair: [upper-left], width, height
        const chairZones = [
            //back (3th) row
            [[246, 237], 34, 30], [[246, 204], 34, 30], [[246, 174], 34, 30], [[246, 142], 34, 30],
            // 2d row
            [[310, 237], 34, 30], [[310, 204], 34, 30], [[310, 174], 34, 30], [[310, 142], 34, 30],
            // 1st row
            [[374, 237], 34, 30], [[374, 204], 34, 30], [[374, 174], 34, 30], [[374, 142], 34, 30]
        ]
        for (const zone of chairZones) this.interactiveObjects.push(new InteractiveObject(zone[0][0], zone[0][1], zone[1], zone[2]));
        for (const zone of chairZones) this.chairZones.push(new InteractiveObject(zone[0][0], zone[0][1], zone[1], zone[2]));
    }

    resize(width, height) {
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
        let sc_y = (this.originalHeight*this.sizeFactor - this.screenHeight) / 2;
        let sc_x = (this.originalWidth*this.sizeFactor - this.screenWidth) / 2;
        setTimeout(function () {
            window.scrollTo(sc_x, sc_y);
        },2);

        // apply sizing
        this.realWidth = this.originalWidth * this.sizeFactor;
        this.realHeight = this.originalHeight * this.sizeFactor;

        // todo: should preferably use the resize methods, but they dont work lol
        this.defStaticLayer();
        this.defDynamicLayer();
    }

    handleClick(event) {
        let mousePos = this.getRelMousePos(event);
        console.log(mousePos);
        let route = [];
        for (let i = 0; i < this.chairZones.length; i++) {
            const chair = this.chairZones[i];
            if(this.isInInteractiveObject(mousePos.x, mousePos.y, chair)) {
                switch (i) {
                    case 0:
                        route = [
                            {x: 420, y: 292},
                            {x: 232, y: 292},
                            {x: 232, y: 263}
                        ];
                        break;
                    case 1:
                        route = [
                            {x: 420, y: 292},
                            {x: 232, y: 292},
                            {x: 232, y: 231}
                        ];
                        break;
                    case 2:
                        route = [
                            {x: 420, y: 292},
                            {x: 232, y: 292},
                            {x: 232, y: 200}
                        ];
                        break;
                    case 3:
                        route = [
                            {x: 420, y: 292},
                            {x: 232, y: 292},
                            {x: 232, y: 166}
                        ];
                        break;
                    case 4:
                        route = [
                            {x: 420, y: 292},
                            {x: 295, y: 292},
                            {x: 295, y: 263}
                        ];
                        break;
                    case 5:
                        route = [
                            {x: 420, y: 292},
                            {x: 295, y: 292},
                            {x: 295, y: 231}
                        ];
                        break;
                    case 6:
                        route = [
                            {x: 420, y: 292},
                            {x: 295, y: 292},
                            {x: 295, y: 200}
                        ];
                        break;
                    case 7:
                        route = [
                            {x: 420, y: 292},
                            {x: 295, y: 292},
                            {x: 295, y: 166}
                        ];
                        break;
                    case 8:
                        route = [
                            {x: 420, y: 292},
                            {x: 360, y: 292},
                            {x: 360, y: 263}
                        ];
                        break;
                    case 9:
                        route = [
                            {x: 420, y: 292},
                            {x: 360, y: 288},
                            {x: 360, y: 200}
                        ];
                        break;
                    case 10:
                        route = [
                            {x: 420, y: 292},
                            {x: 360, y: 292},
                            {x: 360, y: 200}
                        ];
                        break;
                    case 11:
                        route = [
                            {x: 420, y: 292},
                            {x: 360, y: 292},
                            {x: 360, y: 166}
                        ];
                        break;
                }
            }
        }
        if (route.length > 1) {
            this.playerObject.setMovementRoute(route);
            this.playerObject.setMovementSpeed(30);
        }
    }

    handleHover(event) {
        g_currMousePos = this.getRelMousePos(event);
    }

    getMousePos(event) {
        let x = event.offsetX;
        let y = event.offsetY;
        return {
            x: x,
            y: y
        }
    }

    // returns true if the (relative) coordinates are within the given zone.
    isInInteractiveObject(x, y, iObj) {
        if (x > iObj.position.x && x < iObj.position.x+iObj.width){
            if (y > iObj.position.y && y < iObj.position.y+iObj.height) {
                return true;
            }
        }
        return false;
    }

    getRelMousePos(event) {
        let x = event.offsetX;
        let y = event.offsetY;
        return {
            x: x/this.sizeFactor,
            y: y/this.sizeFactor
        }
    }

    clearScreen() {
        this.staticCtx.clearRect(0, 0, this.realWidth, this.realHeight);
        this.dynamicCtx.clearRect(0, 0, this.realWidth, this.realHeight);
    }

    defStaticLayer() {
        this.staticCanvas = document.getElementById("layer1");
        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;
        const ctx = this.staticCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        this.staticCtx = ctx;
    }
    resizeStaticLayer() {
        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;
    }
    drawStaticLayer() {
        const ctx = this.staticCtx;
        let render = new Image();
        render.src = ClassroomRender;
        ctx.drawImage(render, this.left, this.top, this.realWidth, this.realHeight);
    }

    defDynamicLayer() {
        this.dynamicCanvas = document.getElementById("layer2");
        this.dynamicCanvas.width = this.realWidth;
        this.dynamicCanvas.height = this.realHeight;
        const ctx = this.dynamicCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        this.dynamicCtx = ctx;
    }
    resizeDynamicLayer() {
        this.dynamicCanvas.width = this.realWidth;
        this.dynamicCanvas.height = this.realHeight;
    }
    drawDynamicLayer() {
        const ctx = this.dynamicCtx;

        function drawDynObj(scene) { // this has to be done two times so i packaged it in a func
            for (const dynObj of scene.dynamicObjects) {
                dynObj.draw(ctx, scene);
            }
        }

        let light = new Image();
        light.src = ClassroomLight;
        drawDynObj(this);
        ctx.globalCompositeOperation = "soft-light";
        ctx.drawImage(light, this.left, this.top, this.realWidth, this.realHeight);
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(light, this.left, this.top, this.realWidth, this.realHeight);
        ctx.globalCompositeOperation = "destination-atop";
        drawDynObj(this);

        if(g_DEBUG) {
            ctx.globalCompositeOperation = "source-over";
            for (const iObj of this.interactiveObjects) {
                ctx.beginPath();
                ctx.lineWidth = "2";
                ctx.strokeStyle = "yellow";
                if (this.isInInteractiveObject(g_currMousePos.x, g_currMousePos.y, iObj)) { ctx.strokeStyle = "red"; } // mark hovered red
                ctx.rect(iObj.position.x*this.sizeFactor, iObj.position.y*this.sizeFactor, iObj.width*this.sizeFactor, iObj.height*this.sizeFactor);
                ctx.stroke();
            }
        }
    }

    runGameLoop(){
        for (const o of this.dynamicObjects) {
            o.moveOnRoute();
        }
    }
}

class Animator {
    #scene;
    #lastTime;
    deltaTime;
    currTime;
    constructor(scene) {
        this.#scene = scene;
        this.#lastTime = 0;
    }
    #drawFrame() {
        this.#scene.drawStaticLayer();
        this.#scene.drawDynamicLayer();
    }
    animate(currTime) {
        if (!currTime) currTime = 0;
        this.currTime = currTime;
        this.deltaTime = (currTime - this.#lastTime) / 1000; // convert milliseconds to second fractions // convert milliseconds to second fractions
        this.#lastTime = currTime;
        this.#scene.runGameLoop();
        this.#scene.clearScreen();
        this.#drawFrame();

        requestAnimationFrame(this.animate.bind(this));
    }
}
