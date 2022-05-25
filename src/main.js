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


// an object that can be moved around
class DynamicObject {
    height;
    width;

    sprite;

    position;
    targetPosition;

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
        this.targetPosition = this.position = {x: 0, y: 0};
    }

    setPos(x, y) {
        this.position = {x: x, y: y};
    }

    moveToTarget() {
        if (this.position !== this.targetPosition) {
            let a = 1; // todo
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

    dynamicObjects = [];
    interactiveObjects = [];

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
        this.dynamicObjects.push(userCharacter);

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
        for (const o of this.dynamicObjects) {
            o.setPos(mousePos.x-16, mousePos.y-32);
            console.log('help me')
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

    // returns true if the (relative) coordinates are withing the given zone.
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
        this.#scene.clearScreen();
        this.#drawFrame();

        requestAnimationFrame(this.animate.bind(this));
    }
}
