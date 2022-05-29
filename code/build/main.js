/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/Animator.ts
var Animator = /** @class */ (function () {
    function Animator(scene) {
        this.currTime = 0;
        this._scene = scene;
        this._lastTime = 0;
        this._deltaTime = 0;
    }
    Animator.prototype._drawFrame = function () {
        this._scene.drawStaticLayer();
        this._scene.drawDynamicLayer();
    };
    Animator.prototype.getDeltaTime = function () {
        return this._deltaTime;
    };
    Animator.prototype.animate = function (currTime) {
        if (currTime === void 0) { currTime = 0; }
        this.currTime = currTime; // make this available for the scene
        this._deltaTime = (currTime - this._lastTime) / 1000; // convert milliseconds to second fractions
        this._lastTime = currTime;
        this._scene.runGameLoop();
        this._scene.clearScreen();
        this._drawFrame();
        requestAnimationFrame(this.animate.bind(this));
    };
    return Animator;
}());
/* harmony default export */ const src_Animator = (Animator);

;// CONCATENATED MODULE: ./src/Vector.ts
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.length = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    Vector.prototype.add = function (other) {
        return new Vector(this.x + other.x, this.y + other.y);
    };
    Vector.prototype.distanceTo = function (other) {
        return Math.sqrt(Math.pow((this.x - other.x), 2) +
            Math.pow((this.y - other.y), 2));
    };
    Vector.prototype.normalized = function () {
        var len = this.length();
        if (len !== 0)
            return new Vector(this.x / len, this.y / len);
        else
            return new Vector(0, 0);
    };
    return Vector;
}());
/* harmony default export */ const src_Vector = (Vector);

;// CONCATENATED MODULE: ./src/Globals.ts

var Globals = /** @class */ (function () {
    function Globals() {
    }
    Globals.getCurrentMousePos = function () {
        return this._currentMousePosition;
    };
    Globals.setCurrentMousePos = function (pos) {
        this._currentMousePosition = pos;
    };
    Globals.getActiveAnimator = function () {
        return this._activeAnimator;
    };
    Globals.setActiveAnimator = function (anim) {
        this._activeAnimator = anim;
    };
    Globals.getActiveScene = function () {
        return this._activeScene;
    };
    Globals.setActiveScene = function (scene) {
        this._activeScene = scene;
    };
    // config fields
    Globals.DEBUG = true;
    // mouse position
    Globals._currentMousePosition = new src_Vector(0, 0);
    return Globals;
}());
/* harmony default export */ const src_Globals = (Globals);

;// CONCATENATED MODULE: ./src/InteractiveObject.ts
var InteractiveObject = /** @class */ (function () {
    function InteractiveObject(startingPos, width, height) {
        this.position = startingPos;
        this.width = width;
        this.height = height;
    }
    return InteractiveObject;
}());
/* harmony default export */ const src_InteractiveObject = (InteractiveObject);

;// CONCATENATED MODULE: ./src/DynamicObject.ts


var DynamicObject = /** @class */ (function () {
    function DynamicObject(height, width, sprite, animationFrames, animationSpeed, idleSpritePaths, walkSpritePaths) {
        this.movementRoute = []; // a list of x, y position objects
        this.positionOnRoute = 0; // an index of the current position in the above route
        this.distToNextPoint = 0;
        this.animationStep = 0; // current animation frame of the sprite-sheet
        // this is used to check when the animate method was last called
        // to prevent double animation calls in one frame
        this.lastTime = 0;
        this.height = height;
        this.width = width;
        this.sprite = sprite;
        this.animationFrames = animationFrames;
        this.animationSpeed = animationSpeed;
        this.position = new src_Vector(0, 0);
        this.movementSpeed = 0;
        this.setSprites(idleSpritePaths, walkSpritePaths);
    }
    DynamicObject.prototype.setSprites = function (idleSpritePaths, walkSpritePaths) {
        this.spritesIdle = [new Image(), new Image(), new Image(), new Image()];
        for (var i = 0, len = this.spritesIdle.length; i < len; i++) {
            this.spritesIdle[i].src = idleSpritePaths[i];
        }
        this.spritesWalk = [new Image(), new Image(), new Image(), new Image()];
        for (var i = 0, len = this.spritesWalk.length; i < len; i++) {
            this.spritesWalk[i].src = walkSpritePaths[i];
        }
    };
    DynamicObject.prototype.setMovementRoute = function (route) {
        var _this = this;
        // adjust route points for object size
        var adjustedRoute = route.map(function (pos) {
            var adjustedPos = pos;
            adjustedPos.x -= _this.width / 2;
            adjustedPos.y -= _this.height;
            return adjustedPos;
        });
        this.movementRoute = adjustedRoute;
        this.positionOnRoute = 0;
        var firstPoint = route[0];
        this.setPos(firstPoint.x, firstPoint.y);
        this.distToNextPoint = firstPoint.distanceTo(route[1]);
    };
    DynamicObject.prototype.setMovementSpeed = function (speed) {
        this.movementSpeed = speed;
    };
    DynamicObject.prototype.setPos = function (x, y) {
        this.position = new src_Vector(x, y);
    };
    DynamicObject.prototype.selectSprite = function (direction) {
        if (direction.x === 0 && direction.y === 0) {
            this.sprite = this.spritesIdle[2];
        }
        else if (Math.abs(direction.x) > Math.abs(direction.y)) {
            // horizontal movement is stronger
            if (direction.x > 0)
                this.sprite = this.spritesWalk[3];
            else
                this.sprite = this.spritesWalk[1];
        }
        else {
            // vertical movement is stronger
            if (direction.y > 0)
                this.sprite = this.spritesWalk[2];
            else
                this.sprite = this.spritesWalk[0];
        }
    };
    DynamicObject.prototype.moveOnRoute = function () {
        if (this.positionOnRoute < this.movementRoute.length - 1) {
            var target = this.movementRoute[this.positionOnRoute + 1];
            var direction = new src_Vector(target.x - this.position.x, target.y - this.position.y);
            this.selectSprite(direction);
            // normalizing the direction vector
            var normDirection = direction.normalized();
            // this will be used a couple times, so make is short
            var deltaTime = src_Globals.getActiveAnimator().getDeltaTime();
            // check if route point already reached
            this.distToNextPoint -=
                this.movementSpeed * deltaTime;
            if (this.distToNextPoint < 0) {
                this.setPos(target.x, target.y);
                this.positionOnRoute += 1;
                // only calculate the next distance only if the end hasn't
                // been reached yet.
                if (this.positionOnRoute < this.movementRoute.length - 1) {
                    this.distToNextPoint = this.position.distanceTo(this.movementRoute[this.positionOnRoute + 1]);
                }
            }
            else {
                this.setPos(this.position.x + normDirection.x * deltaTime * this.movementSpeed, this.position.y + normDirection.y * deltaTime * this.movementSpeed);
            }
        }
        else {
            // if not moving, do...
            this.selectSprite(new src_Vector(0, 0));
        }
    };
    DynamicObject.prototype.animate = function () {
        // prevent animation from progressing multiple times each frame
        // if the obj is rendered multiple times by comparing the last timestamp with the current one
        if (this.lastTime !== src_Globals.getActiveAnimator().currTime) {
            this.animationStep +=
                src_Globals.getActiveAnimator().getDeltaTime() * this.animationSpeed;
            if (this.animationStep > this.animationFrames)
                this.animationStep = 0;
        }
        this.lastTime = src_Globals.getActiveAnimator().currTime;
    };
    DynamicObject.prototype.draw = function (ctx, scene) {
        ctx.drawImage(this.sprite, Math.floor(this.animationStep) * this.width, 0, 32, 32, this.position.x * scene.sizeFactor, this.position.y * scene.sizeFactor, this.height * scene.sizeFactor, this.width * scene.sizeFactor);
        this.animate();
    };
    return DynamicObject;
}());
/* harmony default export */ const src_DynamicObject = (DynamicObject);

;// CONCATENATED MODULE: ./src/ClassroomScene.ts




// resource paths
// classroom
var ClassroomRender = '/resources/scenes/classroom/ClassroomRender.png';
var ClassroomLight = '/resources/scenes/classroom/ClassroomLight.png';
// female student
var Femalestudentwalkingeast = '../resources/characters/female_student/Femalestudentwalkingeast-sheet.png';
var Femalestudentwalkingnorth = '../resources/characters/female_student/Femalestudentwalkingnorth-sheet.png';
var Femalestudentwalkingsouth = '../resources/characters/female_student/Femalestudentwalkingsouth-sheet.png';
var Femalestudentwalkingwest = '../resources/characters/female_student/Femalestudentwalkingwest-sheet.png';
var ClassroomScene = /** @class */ (function () {
    function ClassroomScene(screenWidth, screenHeight) {
        // the pixel size of the original scene art
        this.originalWidth = 684;
        this.originalHeight = 454;
        // an additional scaling factor, that can be used to
        // apply additional scaling
        this.zoomFactor = 1.1;
        this.dynamicObjects = [];
        // an array containing all InteractiveObjects in the scene
        this.interactiveObjects = [];
        this.chairZones = [];
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
        var sc_y = (this.originalHeight *
            this.sizeFactor -
            this.screenHeight) / 2;
        var sc_x = (this.originalWidth *
            this.sizeFactor -
            this.screenWidth) / 2;
        setTimeout(function () {
            window.scrollTo(sc_x, sc_y);
        }, 2);
        // apply sizing
        this.realWidth = this.originalWidth * this.sizeFactor;
        this.realHeight = this.originalHeight * this.sizeFactor;
        this.defStaticLayer();
        this.defDynamicLayer();
        this.defGameLogic();
    }
    ClassroomScene.prototype.resize = function (width, height) {
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
        var sc_y = (this.originalHeight * this.sizeFactor - this.screenHeight) / 2;
        var sc_x = (this.originalWidth * this.sizeFactor - this.screenWidth) / 2;
        setTimeout(function () {
            window.scrollTo(sc_x, sc_y);
        }, 2);
        // apply sizing
        this.realWidth = this.originalWidth * this.sizeFactor;
        this.realHeight = this.originalHeight * this.sizeFactor;
        // TODO: should preferably use the resize methods, but they dont work lol
        this.resizeStaticLayer();
        this.resizeDynamicLayer();
    };
    ClassroomScene.prototype.handleClick = function (event) {
        var mousePos = this.getRelMousePos(event);
        console.log(mousePos);
        var route = []; // TODO: replace the entire system lol
        for (var i = 0; i < this.chairZones.length; i++) {
            var chair = this.chairZones[i];
            if (this.isWithinInteractiveObject(mousePos, chair)) {
                console.log('hit chair');
                switch (i) {
                    case 0:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(232, 292),
                            new src_Vector(232, 263)
                        ];
                        break;
                    case 1:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(232, 292),
                            new src_Vector(232, 231)
                        ];
                        break;
                    case 2:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(232, 292),
                            new src_Vector(232, 200)
                        ];
                        break;
                    case 3:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(232, 292),
                            new src_Vector(232, 166)
                        ];
                        break;
                    case 4:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(295, 292),
                            new src_Vector(295, 263)
                        ];
                        break;
                    case 5:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(295, 292),
                            new src_Vector(295, 231)
                        ];
                        break;
                    case 6:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(295, 292),
                            new src_Vector(295, 200)
                        ];
                        break;
                    case 7:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(295, 292),
                            new src_Vector(295, 166)
                        ];
                        break;
                    case 8:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(360, 292),
                            new src_Vector(360, 263)
                        ];
                        break;
                    case 9:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(360, 288),
                            new src_Vector(360, 200)
                        ];
                        break;
                    case 10:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(360, 292),
                            new src_Vector(360, 200)
                        ];
                        break;
                    case 11:
                        route = [
                            new src_Vector(420, 292),
                            new src_Vector(360, 292),
                            new src_Vector(360, 166)
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
    };
    ClassroomScene.prototype.handleHover = function (event) {
        src_Globals.setCurrentMousePos(this.getRelMousePos(event));
    };
    ClassroomScene.prototype.getMousePos = function (event) {
        return new src_Vector(event.offsetX, event.offsetY);
    };
    // returns true if the (relative) coordinates are within the given zone.
    ClassroomScene.prototype.isWithinInteractiveObject = function (pos, iObj) {
        if (pos.x > iObj.position.x * this.sizeFactor && pos.x < iObj.position.x * this.sizeFactor + iObj.width * this.sizeFactor) {
            if (pos.y > iObj.position.y * this.sizeFactor && pos.y < iObj.position.y * this.sizeFactor + iObj.height * this.sizeFactor) {
                return true;
            }
        }
        return false;
    };
    ClassroomScene.prototype.getRelMousePos = function (event) {
        var pos = new src_Vector(event.offsetX, event.offsetY);
        return pos;
    };
    ClassroomScene.prototype.clearScreen = function () {
        this.staticCtx.clearRect(0, 0, this.realWidth, this.realHeight);
        this.dynamicCtx.clearRect(0, 0, this.realWidth, this.realHeight);
    };
    ClassroomScene.prototype.defStaticLayer = function () {
        // get canvas
        var staCanvas = document.getElementById('layer1');
        if (staCanvas)
            this.staticCanvas = staCanvas;
        else
            throw new TypeError("Static canvas element was null!");
        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;
        // get ctx
        var ctx = this.staticCanvas.getContext('2d');
        if (ctx)
            this.staticCtx = ctx;
        else
            throw new TypeError("Static context was null!");
        // disable smoothing out pixels
        this.staticCtx.imageSmoothingEnabled = false;
    };
    ClassroomScene.prototype.resizeStaticLayer = function () {
        this.staticCanvas.width = this.realWidth;
        this.staticCanvas.height = this.realHeight;
        // get ctx
        var ctx = this.staticCanvas.getContext('2d');
        if (ctx)
            this.staticCtx = ctx;
        else
            throw new TypeError("Static context was null!");
        // disable smoothing out pixels
        this.staticCtx.imageSmoothingEnabled = false;
    };
    ClassroomScene.prototype.drawStaticLayer = function () {
        var ctx = this.staticCtx;
        var render = new Image();
        render.src = ClassroomRender;
        ctx.drawImage(render, this.left, this.top, this.realWidth, this.realHeight);
    };
    ClassroomScene.prototype.defDynamicLayer = function () {
        var _this = this;
        // get canvas
        var dynCanvas = document.getElementById('layer2');
        if (dynCanvas)
            this.dynamicCanvas = dynCanvas;
        else
            throw new TypeError("Dynamic canvas element was null!");
        this.dynamicCanvas.width = this.realWidth;
        this.dynamicCanvas.height = this.realHeight;
        // register interaction events
        this.dynamicCanvas.onclick = this.handleClick.bind(this);
        this.dynamicCanvas.addEventListener('mousemove', function (e) {
            _this.handleHover(e);
        });
        // get ctx
        var ctx = this.dynamicCanvas.getContext('2d');
        if (ctx)
            this.dynamicCtx = ctx;
        else
            throw new TypeError("Dynamic context was null!");
        // disable smoothing out pixels
        this.dynamicCtx.imageSmoothingEnabled = false;
    };
    ClassroomScene.prototype.resizeDynamicLayer = function () {
        this.dynamicCanvas.width = this.realWidth;
        this.dynamicCanvas.height = this.realHeight;
        // get ctx
        var ctx = this.dynamicCanvas.getContext('2d');
        if (ctx)
            this.dynamicCtx = ctx;
        else
            throw new TypeError("Dynamic context was null!");
        // disable smoothing out pixels
        this.dynamicCtx.imageSmoothingEnabled = false;
    };
    ClassroomScene.prototype.drawDynamicLayer = function () {
        var ctx = this.dynamicCtx;
        // this has to be done two times so i packaged it in a func
        function drawDynObj(scene) {
            for (var _i = 0, _a = scene.dynamicObjects; _i < _a.length; _i++) {
                var dynObj = _a[_i];
                dynObj.draw(ctx, scene);
            }
        }
        var light = new Image();
        light.src = ClassroomLight;
        drawDynObj(this);
        ctx.globalCompositeOperation = 'soft-light';
        ctx.drawImage(light, this.left, this.top, this.realWidth, this.realHeight);
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(light, this.left, this.top, this.realWidth, this.realHeight);
        ctx.globalCompositeOperation = 'destination-atop';
        drawDynObj(this);
        if (src_Globals.DEBUG) {
            ctx.globalCompositeOperation = 'source-over';
            for (var _i = 0, _a = this.interactiveObjects; _i < _a.length; _i++) {
                var iObj = _a[_i];
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'yellow';
                // mark hovered objects in red
                var currMousePos = src_Globals.getCurrentMousePos();
                if (this.isWithinInteractiveObject(currMousePos, iObj))
                    ctx.strokeStyle = 'red';
                ctx.rect(iObj.position.x * this.sizeFactor, iObj.position.y * this.sizeFactor, iObj.width * this.sizeFactor, iObj.height * this.sizeFactor);
                ctx.stroke();
            }
        }
    };
    ClassroomScene.prototype.defGameLogic = function () {
        // get sprite
        var userCharacterSprite = new Image();
        userCharacterSprite.src = Femalestudentwalkingeast;
        // make object
        var userCharacter = new src_DynamicObject(32, 32, userCharacterSprite, 8, 5.5, [Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast], [Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast]);
        userCharacter.setPos(400, 400);
        this.playerObject = userCharacter;
        this.dynamicObjects.push(userCharacter);
        // define chair zones
        // for each chair: [upper-left], width, height
        var chairZones = [
            // back (3th) row
            [new src_Vector(246, 237), 34, 30],
            [new src_Vector(246, 204), 34, 30],
            [new src_Vector(246, 174), 34, 30],
            [new src_Vector(246, 142), 34, 30],
            // 2d row
            [new src_Vector(310, 237), 34, 30],
            [new src_Vector(310, 204), 34, 30],
            [new src_Vector(310, 174), 34, 30],
            [new src_Vector(310, 142), 34, 30],
            // 1st row
            [new src_Vector(374, 237), 34, 30],
            [new src_Vector(374, 204), 34, 30],
            [new src_Vector(374, 174), 34, 30],
            [new src_Vector(374, 142), 34, 30],
        ];
        for (var _i = 0, chairZones_1 = chairZones; _i < chairZones_1.length; _i++) {
            var zone = chairZones_1[_i];
            this.interactiveObjects.push(new src_InteractiveObject(zone[0], zone[1], zone[2]));
        }
        for (var _a = 0, chairZones_2 = chairZones; _a < chairZones_2.length; _a++) {
            var zone = chairZones_2[_a];
            this.chairZones.push(new src_InteractiveObject(zone[0], zone[1], zone[2]));
        }
    };
    ClassroomScene.prototype.runGameLoop = function () {
        for (var _i = 0, _a = this.dynamicObjects; _i < _a.length; _i++) {
            var o = _a[_i];
            o.moveOnRoute();
        }
    };
    return ClassroomScene;
}());
/* harmony default export */ const src_ClassroomScene = (ClassroomScene);

;// CONCATENATED MODULE: ./src/main.ts



window.onload = function () {
    src_Globals.setActiveScene(new src_ClassroomScene(window.innerWidth, window.innerHeight));
    src_Globals.setActiveAnimator(new src_Animator(src_Globals.getActiveScene()));
    src_Globals.getActiveAnimator().animate();
};
window.addEventListener('resize', function () {
    var activeScene = src_Globals.getActiveScene();
    if (activeScene != null) {
        activeScene.resize(window.innerWidth, window.innerHeight);
    }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3lCQUN2QixDQUFDO3dCQUNGLE1BQU07b0JBQ04sS0FBSyxDQUFDO3dCQUNGLEtBQUssR0FBRzs0QkFDUixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3lCQUN2QixDQUFDO3dCQUNGLE1BQU07b0JBQ04sS0FBSyxDQUFDO3dCQUNGLEtBQUssR0FBRzs0QkFDUixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3lCQUN2QixDQUFDO3dCQUNGLE1BQU07b0JBQ04sS0FBSyxDQUFDO3dCQUNGLEtBQUssR0FBRzs0QkFDUixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3lCQUN2QixDQUFDO3dCQUNGLE1BQU07b0JBQ04sS0FBSyxDQUFDO3dCQUNGLEtBQUssR0FBRzs0QkFDUixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO3lCQUN2QixDQUFDO3dCQUNGLE1BQU07b0JBQ04sS0FBSyxDQUFDO3dCQUNGLEtBQUssR0FBRzs0QkFDUixJQUFJLFVBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzRCQUNwQixJQUFJLFVBQU0s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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFBO0lBQzFCLENBQUM7SUFFRCxvQ0FBVyxHQUFYO1FBQ0ksS0FBZ0IsVUFBbUIsRUFBbkIsU0FBSSxDQUFDLGNBQWMsRUFBbkIsY0FBbUIsRUFBbkIsSUFBbUIsRUFBRTtZQUFoQyxJQUFNLENBQUM7WUFDUixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDbkI7SUFDTCxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDOzs7O0FDdmJpQztBQUNGO0FBQ2M7QUFFOUMsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUNaLDBCQUFzQixDQUNsQixJQUFJLGtCQUFjLENBQ2QsTUFBTSxDQUFDLFVBQVUsRUFDakIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFN0IsNkJBQXlCLENBQ3JCLElBQUksWUFBUSxDQUNSLDBCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNCLDZCQUF5QixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEQsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtJQUM5QixJQUFNLFdBQVcsR0FBRywwQkFBc0IsRUFBRSxDQUFDO0lBQzdDLElBQUksV0FBVyxJQUFJLElBQUksRUFBRTtRQUNyQixXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzdEO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvQW5pbWF0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1ZlY3Rvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvR2xvYmFscy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvSW50ZXJhY3RpdmVPYmplY3QudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0R5bmFtaWNPYmplY3QudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0NsYXNzcm9vbVNjZW5lLnRzIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5pbWF0b3Ige1xuICAgIF9zY2VuZTogU2NlbmU7XG4gICAgX2xhc3RUaW1lOiBudW1iZXI7XG4gICAgX2RlbHRhVGltZTogbnVtYmVyO1xuICAgIGN1cnJUaW1lOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBTY2VuZSkge1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2RlbHRhVGltZSA9IDA7XG4gICAgfVxuXG4gICAgX2RyYXdGcmFtZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2NlbmUuZHJhd1N0YXRpY0xheWVyKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmRyYXdEeW5hbWljTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBnZXREZWx0YVRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlbHRhVGltZTtcbiAgICB9XG5cbiAgICBhbmltYXRlKGN1cnJUaW1lOiBudW1iZXIgPSAwKSB7XG4gICAgICAgIHRoaXMuY3VyclRpbWUgPSBjdXJyVGltZTsgLy8gbWFrZSB0aGlzIGF2YWlsYWJsZSBmb3IgdGhlIHNjZW5lXG5cbiAgICAgICAgdGhpcy5fZGVsdGFUaW1lID0gKGN1cnJUaW1lIC0gdGhpcy5fbGFzdFRpbWUpIC8gMTAwMDsgLy8gY29udmVydCBtaWxsaXNlY29uZHMgdG8gc2Vjb25kIGZyYWN0aW9uc1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IGN1cnJUaW1lO1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLnJ1bkdhbWVMb29wKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmNsZWFyU2NyZWVuKCk7XG4gICAgICAgIHRoaXMuX2RyYXdGcmFtZSgpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvciB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICoqIDIgKyB0aGlzLnkgKiogMik7XG4gICAgfVxuXG4gICAgYWRkKG90aGVyOiBWZWN0b3IpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgICAgIHRoaXMueCArIG90aGVyLngsXG4gICAgICAgICAgICB0aGlzLnkgKyBvdGhlci55XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2VUbyhvdGhlcjogVmVjdG9yKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgICAgICAgICh0aGlzLnggLSBvdGhlci54KSAqKiAyICtcbiAgICAgICAgICAgICAgICAodGhpcy55IC0gb3RoZXIueSkgKiogMlxuICAgICAgICApO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZWQoKTogVmVjdG9yIHtcbiAgICAgICAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGgoKTtcbiAgICAgICAgaWYobGVuICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3RvcigwLCAwKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcbmltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yJztcbmltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2xvYmFscyB7XG4gICAgLy8gY29uZmlnIGZpZWxkc1xuICAgIHN0YXRpYyBERUJVRzogYm9vbGVhbiA9IHRydWU7XG5cbiAgICAvLyBtb3VzZSBwb3NpdGlvblxuICAgIHN0YXRpYyBfY3VycmVudE1vdXNlUG9zaXRpb246IFZlY3RvciA9IG5ldyBWZWN0b3IoMCwgMCk7XG4gICAgc3RhdGljIGdldEN1cnJlbnRNb3VzZVBvcygpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb247XG4gICAgfVxuICAgIHN0YXRpYyBzZXRDdXJyZW50TW91c2VQb3MocG9zOiBWZWN0b3IpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24gPSBwb3M7XG4gICAgfVxuXG4gICAgLy8gYW5pbWF0b3JcbiAgICBzdGF0aWMgX2FjdGl2ZUFuaW1hdG9yOiBBbmltYXRvcjtcbiAgICBzdGF0aWMgZ2V0QWN0aXZlQW5pbWF0b3IoKTogQW5pbWF0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlQW5pbWF0b3I7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRBY3RpdmVBbmltYXRvcihhbmltOiBBbmltYXRvcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9hY3RpdmVBbmltYXRvciA9IGFuaW07XG4gICAgfVxuXG4gICAgLy8gc2NlbmVcbiAgICBzdGF0aWMgX2FjdGl2ZVNjZW5lOiBTY2VuZTtcbiAgICBzdGF0aWMgZ2V0QWN0aXZlU2NlbmUoKTogU2NlbmUge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlU2NlbmU7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRBY3RpdmVTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fYWN0aXZlU2NlbmUgPSBzY2VuZTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmFjdGl2ZU9iamVjdCB7XG4gIHBvc2l0aW9uOiBWZWN0b3I7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0aW5nUG9zOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0aW5nUG9zO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgfVxufVxuIiwiaW1wb3J0IEdsb2JhbHMgZnJvbSAnLi9HbG9iYWxzJztcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuaW1wb3J0IFNjZW5lIGZyb20gJy4vU2NlbmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEeW5hbWljT2JqZWN0IHtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuXG4gICAgc3ByaXRlOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gICAgLy8gTiwgVywgUywgRVxuICAgIHNwcml0ZXNJZGxlITogW1xuICAgICAgICBIVE1MSW1hZ2VFbGVtZW50LFxuICAgICAgICBIVE1MSW1hZ2VFbGVtZW50LFxuICAgICAgICBIVE1MSW1hZ2VFbGVtZW50LFxuICAgICAgICBIVE1MSW1hZ2VFbGVtZW50XTtcblxuICAgIC8vIE4sIFcsIFMsIEVcbiAgICBzcHJpdGVzV2FsayE6IFtcbiAgICAgICAgSFRNTEltYWdlRWxlbWVudCxcbiAgICAgICAgSFRNTEltYWdlRWxlbWVudCxcbiAgICAgICAgSFRNTEltYWdlRWxlbWVudCxcbiAgICAgICAgSFRNTEltYWdlRWxlbWVudF07XG5cbiAgcG9zaXRpb246IFZlY3RvcjsgLy8gY3VycmVudCB4LCB5IHBvc2l0aW9uXG5cbiAgbW92ZW1lbnRSb3V0ZTogVmVjdG9yW10gPSBbXTsgLy8gYSBsaXN0IG9mIHgsIHkgcG9zaXRpb24gb2JqZWN0c1xuICBwb3NpdGlvbk9uUm91dGU6IG51bWJlciA9IDA7IC8vIGFuIGluZGV4IG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBhYm92ZSByb3V0ZVxuICBtb3ZlbWVudFNwZWVkOiBudW1iZXI7XG4gIGRpc3RUb05leHRQb2ludDogbnVtYmVyID0gMDtcblxuICBhbmltYXRpb25TdGVwOiBudW1iZXIgPSAwOyAvLyBjdXJyZW50IGFuaW1hdGlvbiBmcmFtZSBvZiB0aGUgc3ByaXRlLXNoZWV0XG4gIGFuaW1hdGlvbkZyYW1lczogbnVtYmVyOyAvLyB0b3RhbCBhbW91bnQgb2YgYW5pbWF0aW9uIGZyYW1lcyBpbiBzcHJpdGUtc2hlZXRcbiAgYW5pbWF0aW9uU3BlZWQ6IG51bWJlcjsgLy8gYW5pbWF0aW9uIGZyYW1lcyBwZXIgc2Vjb25kXG5cbiAgLy8gdGhpcyBpcyB1c2VkIHRvIGNoZWNrIHdoZW4gdGhlIGFuaW1hdGUgbWV0aG9kIHdhcyBsYXN0IGNhbGxlZFxuICAvLyB0byBwcmV2ZW50IGRvdWJsZSBhbmltYXRpb24gY2FsbHMgaW4gb25lIGZyYW1lXG4gIGxhc3RUaW1lOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGhlaWdodDogbnVtYmVyLFxuICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyLFxuICAgICAgICAgICAgICBzcHJpdGU6IEhUTUxJbWFnZUVsZW1lbnQsXG4gICAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lczogbnVtYmVyLCBhbmltYXRpb25TcGVlZDogbnVtYmVyLFxuICAgICAgICAgICAgICBpZGxlU3ByaXRlUGF0aHM6IHN0cmluZ1tdLCB3YWxrU3ByaXRlUGF0aHM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVzID0gYW5pbWF0aW9uRnJhbWVzO1xuICAgIHRoaXMuYW5pbWF0aW9uU3BlZWQgPSBhbmltYXRpb25TcGVlZDtcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcigwLCAwKTtcbiAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAwO1xuICAgIHRoaXMuc2V0U3ByaXRlcyhpZGxlU3ByaXRlUGF0aHMsIHdhbGtTcHJpdGVQYXRocyk7XG4gIH1cblxuICBzZXRTcHJpdGVzKGlkbGVTcHJpdGVQYXRoczogc3RyaW5nW10sIHdhbGtTcHJpdGVQYXRoczogc3RyaW5nW10pIHtcbiAgICB0aGlzLnNwcml0ZXNJZGxlID0gW25ldyBJbWFnZSgpLCBuZXcgSW1hZ2UoKSwgbmV3IEltYWdlKCksIG5ldyBJbWFnZSgpXTtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5zcHJpdGVzSWRsZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB0aGlzLnNwcml0ZXNJZGxlW2ldLnNyYyA9IGlkbGVTcHJpdGVQYXRoc1tpXTtcbiAgICB9XG4gICAgdGhpcy5zcHJpdGVzV2FsayA9IFtuZXcgSW1hZ2UoKSwgbmV3IEltYWdlKCksIG5ldyBJbWFnZSgpLCBuZXcgSW1hZ2UoKV07XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHRoaXMuc3ByaXRlc1dhbGsubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdGhpcy5zcHJpdGVzV2Fsa1tpXS5zcmMgPSB3YWxrU3ByaXRlUGF0aHNbaV07XG4gICAgfVxuICB9XG5cbiAgc2V0TW92ZW1lbnRSb3V0ZShyb3V0ZTogVmVjdG9yW10pIHtcbiAgICAvLyBhZGp1c3Qgcm91dGUgcG9pbnRzIGZvciBvYmplY3Qgc2l6ZVxuICAgIGNvbnN0IGFkanVzdGVkUm91dGUgPSByb3V0ZS5tYXAoKHBvczogVmVjdG9yKSA9PiB7XG4gICAgICBjb25zdCBhZGp1c3RlZFBvczogVmVjdG9yID0gcG9zO1xuICAgICAgYWRqdXN0ZWRQb3MueCAtPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgIGFkanVzdGVkUG9zLnkgLT0gdGhpcy5oZWlnaHQ7XG4gICAgICByZXR1cm4gYWRqdXN0ZWRQb3M7XG4gICAgfSk7XG4gICAgdGhpcy5tb3ZlbWVudFJvdXRlID0gYWRqdXN0ZWRSb3V0ZTtcbiAgICB0aGlzLnBvc2l0aW9uT25Sb3V0ZSA9IDA7XG4gICAgY29uc3QgZmlyc3RQb2ludDogVmVjdG9yID0gcm91dGVbMF07XG4gICAgdGhpcy5zZXRQb3MoZmlyc3RQb2ludC54LCBmaXJzdFBvaW50LnkpO1xuICAgIHRoaXMuZGlzdFRvTmV4dFBvaW50ID0gZmlyc3RQb2ludC5kaXN0YW5jZVRvKHJvdXRlWzFdKTtcbiAgfVxuXG4gIHNldE1vdmVtZW50U3BlZWQoc3BlZWQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubW92ZW1lbnRTcGVlZCA9IHNwZWVkO1xuICB9XG5cbiAgc2V0UG9zKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoeCwgeSk7XG4gIH1cblxuICBzZWxlY3RTcHJpdGUoZGlyZWN0aW9uOiBWZWN0b3IpOiB2b2lkIHtcbiAgICBpZiAoZGlyZWN0aW9uLnggPT09IDAgJiYgZGlyZWN0aW9uLnkgPT09IDApIHtcbiAgICAgIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzSWRsZVsyXTtcbiAgICB9IGVsc2UgaWYgKE1hdGguYWJzKGRpcmVjdGlvbi54KSA+IE1hdGguYWJzKGRpcmVjdGlvbi55KSkge1xuICAgICAgLy8gaG9yaXpvbnRhbCBtb3ZlbWVudCBpcyBzdHJvbmdlclxuICAgICAgaWYgKGRpcmVjdGlvbi54ID4gMCkgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNXYWxrWzNdO1xuICAgICAgZWxzZSB0aGlzLnNwcml0ZSA9IHRoaXMuc3ByaXRlc1dhbGtbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHZlcnRpY2FsIG1vdmVtZW50IGlzIHN0cm9uZ2VyXG4gICAgICBpZiAoZGlyZWN0aW9uLnkgPiAwKSB0aGlzLnNwcml0ZSA9IHRoaXMuc3ByaXRlc1dhbGtbMl07XG4gICAgICBlbHNlIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzV2Fsa1swXTtcbiAgICB9XG4gIH1cblxuICBtb3ZlT25Sb3V0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbk9uUm91dGUgPCB0aGlzLm1vdmVtZW50Um91dGUubGVuZ3RoIC0gMSkge1xuICAgICAgY29uc3QgdGFyZ2V0OiBWZWN0b3IgPSB0aGlzLm1vdmVtZW50Um91dGVbdGhpcy5wb3NpdGlvbk9uUm91dGUgKyAxXTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IG5ldyBWZWN0b3IoXG4gICAgICAgIHRhcmdldC54IC0gdGhpcy5wb3NpdGlvbi54LFxuICAgICAgICB0YXJnZXQueSAtIHRoaXMucG9zaXRpb24ueSxcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuc2VsZWN0U3ByaXRlKGRpcmVjdGlvbik7XG5cbiAgICAgIC8vIG5vcm1hbGl6aW5nIHRoZSBkaXJlY3Rpb24gdmVjdG9yXG4gICAgICBjb25zdCBub3JtRGlyZWN0aW9uOiBWZWN0b3IgPSBkaXJlY3Rpb24ubm9ybWFsaXplZCgpO1xuXG4gICAgICAvLyB0aGlzIHdpbGwgYmUgdXNlZCBhIGNvdXBsZSB0aW1lcywgc28gbWFrZSBpcyBzaG9ydFxuICAgICAgY29uc3QgZGVsdGFUaW1lOiBudW1iZXIgPSBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuZ2V0RGVsdGFUaW1lKCk7XG4gICAgICAvLyBjaGVjayBpZiByb3V0ZSBwb2ludCBhbHJlYWR5IHJlYWNoZWRcbiAgICAgIHRoaXMuZGlzdFRvTmV4dFBvaW50IC09XG4gICAgICAgICAgdGhpcy5tb3ZlbWVudFNwZWVkICogZGVsdGFUaW1lO1xuXG4gICAgICBpZiAodGhpcy5kaXN0VG9OZXh0UG9pbnQgPCAwKSB7XG4gICAgICAgIHRoaXMuc2V0UG9zKHRhcmdldC54LCB0YXJnZXQueSk7XG4gICAgICAgIHRoaXMucG9zaXRpb25PblJvdXRlICs9IDE7XG4gICAgICAgIC8vIG9ubHkgY2FsY3VsYXRlIHRoZSBuZXh0IGRpc3RhbmNlIG9ubHkgaWYgdGhlIGVuZCBoYXNuJ3RcbiAgICAgICAgLy8gYmVlbiByZWFjaGVkIHlldC5cbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb25PblJvdXRlIDwgdGhpcy5tb3ZlbWVudFJvdXRlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLmRpc3RUb05leHRQb2ludCA9IHRoaXMucG9zaXRpb24uZGlzdGFuY2VUbyhcbiAgICAgICAgICAgICAgdGhpcy5tb3ZlbWVudFJvdXRlW3RoaXMucG9zaXRpb25PblJvdXRlICsgMV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFBvcyhcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggKyBub3JtRGlyZWN0aW9uLnggKiBkZWx0YVRpbWUgKiB0aGlzLm1vdmVtZW50U3BlZWQsXG4gICAgICAgICAgdGhpcy5wb3NpdGlvbi55ICsgbm9ybURpcmVjdGlvbi55ICogZGVsdGFUaW1lICogdGhpcy5tb3ZlbWVudFNwZWVkLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiBub3QgbW92aW5nLCBkby4uLlxuICAgICAgdGhpcy5zZWxlY3RTcHJpdGUobmV3IFZlY3RvcigwLCAwKSk7XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0ZSgpOiB2b2lkIHtcbiAgICAvLyBwcmV2ZW50IGFuaW1hdGlvbiBmcm9tIHByb2dyZXNzaW5nIG11bHRpcGxlIHRpbWVzIGVhY2ggZnJhbWVcbiAgICAvLyBpZiB0aGUgb2JqIGlzIHJlbmRlcmVkIG11bHRpcGxlIHRpbWVzIGJ5IGNvbXBhcmluZyB0aGUgbGFzdCB0aW1lc3RhbXAgd2l0aCB0aGUgY3VycmVudCBvbmVcbiAgICBpZiAodGhpcy5sYXN0VGltZSAhPT0gR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmN1cnJUaW1lKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvblN0ZXAgKz1cbiAgICAgICAgICBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuZ2V0RGVsdGFUaW1lKCkgKiB0aGlzLmFuaW1hdGlvblNwZWVkO1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uU3RlcCA+IHRoaXMuYW5pbWF0aW9uRnJhbWVzKSB0aGlzLmFuaW1hdGlvblN0ZXAgPSAwO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmN1cnJUaW1lO1xuICB9XG5cbiAgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NlbmU6IFNjZW5lKTogdm9pZCB7XG4gICAgY3R4LmRyYXdJbWFnZShcbiAgICAgIHRoaXMuc3ByaXRlLFxuICAgICAgTWF0aC5mbG9vcih0aGlzLmFuaW1hdGlvblN0ZXApICogdGhpcy53aWR0aCwgMCxcbiAgICAgIDMyLCAzMixcbiAgICAgIHRoaXMucG9zaXRpb24ueCAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgICB0aGlzLnBvc2l0aW9uLnkgKiBzY2VuZS5zaXplRmFjdG9yLFxuICAgICAgdGhpcy5oZWlnaHQgKiBzY2VuZS5zaXplRmFjdG9yLFxuICAgICAgdGhpcy53aWR0aCAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgKTtcbiAgICB0aGlzLmFuaW1hdGUoKTtcbiAgfVxufVxuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4vU2NlbmUnO1xuaW1wb3J0IFZlY3RvciBmcm9tICcuL1ZlY3Rvcic7XG5pbXBvcnQgSW50ZXJhY3RpdmVPYmplY3QgZnJvbSAnLi9JbnRlcmFjdGl2ZU9iamVjdCc7XG5pbXBvcnQgR2xvYmFscyBmcm9tICcuL0dsb2JhbHMnO1xuaW1wb3J0IER5bmFtaWNPYmplY3QgZnJvbSAnLi9EeW5hbWljT2JqZWN0JztcblxuLy8gcmVzb3VyY2UgcGF0aHNcbi8vIGNsYXNzcm9vbVxuY29uc3QgQ2xhc3Nyb29tUmVuZGVyOiBzdHJpbmcgPVxuICAgICcvcmVzb3VyY2VzL3NjZW5lcy9jbGFzc3Jvb20vQ2xhc3Nyb29tUmVuZGVyLnBuZyc7XG5jb25zdCBDbGFzc3Jvb21MaWdodDogc3RyaW5nID1cbiAgICAnL3Jlc291cmNlcy9zY2VuZXMvY2xhc3Nyb29tL0NsYXNzcm9vbUxpZ2h0LnBuZyc7XG5cbi8vIGZlbWFsZSBzdHVkZW50XG5jb25zdCBGZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3Q6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3Qtc2hlZXQucG5nJztcbmNvbnN0IEZlbWFsZXN0dWRlbnR3YWxraW5nbm9ydGg6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ25vcnRoLXNoZWV0LnBuZyc7XG5jb25zdCBGZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoOiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudHdhbGtpbmdzb3V0aC1zaGVldC5wbmcnO1xuY29uc3QgRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0OiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0LXNoZWV0LnBuZyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xhc3Nyb29tU2NlbmUgaW1wbGVtZW50cyBTY2VuZSB7XG4gICAgLy8gdGhlIHNjZW5lcyBjYW52YXMgbG9jYXRpb25cbiAgICBsZWZ0OiBudW1iZXI7XG4gICAgdG9wOiBudW1iZXI7XG5cbiAgICAvLyB0aGUgc2l6ZSBvZiB0aGUgYWN0dWFsIGF2YWlsYWJsZSBzY3JlZW5cbiAgICBzY3JlZW5XaWR0aDogbnVtYmVyO1xuICAgIHNjcmVlbkhlaWdodDogbnVtYmVyO1xuXG4gICAgLy8gdGhlIGNhbnZhcyBjdHhcbiAgICBzdGF0aWNDdHghOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgZHluYW1pY0N0eCE6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuICAgIHN0YXRpY0NhbnZhcyE6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIGR5bmFtaWNDYW52YXMhOiBIVE1MQ2FudmFzRWxlbWVudDtcblxuICAgIC8vIHRoZSBwaXhlbCBzaXplIG9mIHRoZSBvcmlnaW5hbCBzY2VuZSBhcnRcbiAgICByZWFkb25seSBvcmlnaW5hbFdpZHRoOiBudW1iZXIgPSA2ODQ7XG4gICAgcmVhZG9ubHkgb3JpZ2luYWxIZWlnaHQ6IG51bWJlciA9IDQ1NDtcblxuICAgIC8vIHRoZSBzaXplIG9mIHRoZSBzY2VuZSBhcnQgYWZ0ZXIgc2NhbGluZyBoYXMgYmVlbiBhcHBsaWVkXG4gICAgcmVhbFdpZHRoOiBudW1iZXI7XG4gICAgcmVhbEhlaWdodDogbnVtYmVyO1xuXG4gICAgLy8gdGhlIGZhY3RvciBieSB3aGljaCB0aGUgb3JpZ2luYWwgYXJ0IGhhcyB0byBiZSBzY2FsZWQgdG9cbiAgICAvLyBmaWxsIHRoZSBhdmFpbGFibGUgc2NyZWVuIHNpemUuXG4gICAgc2l6ZUZhY3RvcjogbnVtYmVyO1xuXG4gICAgLy8gYW4gYWRkaXRpb25hbCBzY2FsaW5nIGZhY3RvciwgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICAgIC8vIGFwcGx5IGFkZGl0aW9uYWwgc2NhbGluZ1xuICAgIHpvb21GYWN0b3I6IG51bWJlciA9IDEuMTtcblxuICAgIHBsYXllck9iamVjdCE6IER5bmFtaWNPYmplY3Q7XG4gICAgZHluYW1pY09iamVjdHM6IER5bmFtaWNPYmplY3RbXSA9IFtdO1xuXG4gICAgLy8gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgSW50ZXJhY3RpdmVPYmplY3RzIGluIHRoZSBzY2VuZVxuICAgIGludGVyYWN0aXZlT2JqZWN0czogSW50ZXJhY3RpdmVPYmplY3RbXSA9IFtdO1xuXG4gICAgY2hhaXJab25lczogSW50ZXJhY3RpdmVPYmplY3RbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Ioc2NyZWVuV2lkdGg6IG51bWJlciwgc2NyZWVuSGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5sZWZ0ID0gMDtcbiAgICAgICAgdGhpcy50b3AgPSAwO1xuICAgICAgICB0aGlzLnNjcmVlbldpZHRoID0gc2NyZWVuV2lkdGg7XG4gICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gc2NyZWVuSGVpZ2h0O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmYWN0b3IgYnkgd2hpY2ggb3JpZ2luYWwgaW1hZ2UgaGVpZ2h0XG4gICAgICAgIC8vIGlzIHNtYWxsZXIgdGhhbiBzY3JlZW4uXG4gICAgICAgIHRoaXMuc2l6ZUZhY3RvciA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gdGhpcy5vcmlnaW5hbEhlaWdodDtcblxuICAgICAgICAvLyBhZGp1c3Qgc2l6ZSB0byB3aWR0aCBpZiBhZGp1c3RpbmcgYnkgaGVpZ2h0IGRvZXNuJ3QgZmlsbCBzY3JlZW4uXG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsV2lkdGggKiB0aGlzLnNpemVGYWN0b3IgPCB0aGlzLnNjcmVlbldpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLnNpemVGYWN0b3IgPSB0aGlzLnNjcmVlbldpZHRoIC8gdGhpcy5vcmlnaW5hbFdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaXplRmFjdG9yICo9IHRoaXMuem9vbUZhY3RvcjsgLy8gYXBwbHkgem9vbVxuXG4gICAgICAgIC8vIHNjcm9sbCB0aGUgY2FtZXJhIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjZW5lXG4gICAgICAgIGNvbnN0IHNjX3k6IG51bWJlciA9ICh0aGlzLm9yaWdpbmFsSGVpZ2h0ICpcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemVGYWN0b3IgLVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0KSAvIDI7XG4gICAgICAgIGNvbnN0IHNjX3g6IG51bWJlciA9ICh0aGlzLm9yaWdpbmFsV2lkdGggKlxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZUZhY3RvciAtXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCkgLyAyO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbyhzY194LCBzY195KTtcbiAgICAgICAgfSwgMik7XG5cbiAgICAgICAgLy8gYXBwbHkgc2l6aW5nXG4gICAgICAgIHRoaXMucmVhbFdpZHRoID0gdGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yO1xuICAgICAgICB0aGlzLnJlYWxIZWlnaHQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0ICogdGhpcy5zaXplRmFjdG9yO1xuXG4gICAgICAgIHRoaXMuZGVmU3RhdGljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5kZWZEeW5hbWljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5kZWZHYW1lTG9naWMoKTtcbiAgICB9XG5cbiAgICByZXNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAvLyBjYWxjdWxhdGUgZmFjdG9yIGJ5IHdoaWNoIG9yaWdpbmFsIGltYWdlIGhlaWdodCBpcyBzbWFsbGVyIHRoYW4gc2NyZWVuLlxuICAgICAgICB0aGlzLnNpemVGYWN0b3IgPSB0aGlzLnNjcmVlbkhlaWdodCAvIHRoaXMub3JpZ2luYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gYWRqdXN0IHNpemUgdG8gd2lkdGggaWYgYWRqdXN0aW5nIGJ5IGhlaWdodCBkb2Vzbid0IGZpbGwgc2NyZWVuLlxuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yIDwgdGhpcy5zY3JlZW5XaWR0aCkge1xuICAgICAgICAgICAgdGhpcy5zaXplRmFjdG9yID0gdGhpcy5zY3JlZW5XaWR0aCAvIHRoaXMub3JpZ2luYWxXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2l6ZUZhY3RvciAqPSB0aGlzLnpvb21GYWN0b3I7IC8vIGFwcGx5IHpvb21cblxuICAgICAgICAvLyBzY3JvbGwgdGhlIGNhbWVyYSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY2VuZVxuICAgICAgICBjb25zdCBzY195ID0gKHRoaXMub3JpZ2luYWxIZWlnaHQgKiB0aGlzLnNpemVGYWN0b3IgLSB0aGlzLnNjcmVlbkhlaWdodCkgLyAyO1xuICAgICAgICBjb25zdCBzY194ID0gKHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvciAtIHRoaXMuc2NyZWVuV2lkdGgpIC8gMjtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oc2NfeCwgc2NfeSk7XG4gICAgICAgIH0sIDIpO1xuXG4gICAgICAgIC8vIGFwcGx5IHNpemluZ1xuICAgICAgICB0aGlzLnJlYWxXaWR0aCA9IHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvcjtcbiAgICAgICAgdGhpcy5yZWFsSGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEhlaWdodCAqIHRoaXMuc2l6ZUZhY3RvcjtcblxuICAgICAgICAvLyBUT0RPOiBzaG91bGQgcHJlZmVyYWJseSB1c2UgdGhlIHJlc2l6ZSBtZXRob2RzLCBidXQgdGhleSBkb250IHdvcmsgbG9sXG4gICAgICAgIHRoaXMucmVzaXplU3RhdGljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5yZXNpemVEeW5hbWljTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBtb3VzZVBvczogVmVjdG9yID0gdGhpcy5nZXRSZWxNb3VzZVBvcyhldmVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKG1vdXNlUG9zKTtcbiAgICAgICAgbGV0IHJvdXRlOiBWZWN0b3JbXSA9IFtdOyAvLyBUT0RPOiByZXBsYWNlIHRoZSBlbnRpcmUgc3lzdGVtIGxvbFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2hhaXJab25lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hhaXIgPSB0aGlzLmNoYWlyWm9uZXNbaV07XG4gICAgICAgICAgICBpZiAodGhpcy5pc1dpdGhpbkludGVyYWN0aXZlT2JqZWN0KG1vdXNlUG9zLCBjaGFpcikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGl0IGNoYWlyJylcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDQyMCwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMjMyLCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigyMzIsIDI2MylcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcig0MjAsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDIzMiwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMjMyLCAyMzEpXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoNDIwLCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigyMzIsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDIzMiwgMjAwKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDQyMCwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMjMyLCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigyMzIsIDE2NilcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcig0MjAsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDI5NSwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMjk1LCAyNjMpXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoNDIwLCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigyOTUsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDI5NSwgMjMxKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDQyMCwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMjk1LCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigyOTUsIDIwMClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcig0MjAsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDI5NSwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMjk1LCAxNjYpXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoNDIwLCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigzNjAsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDM2MCwgMjYzKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDQyMCwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMzYwLCAyODgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigzNjAsIDIwMClcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoNDIwLCAyOTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcigzNjAsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDM2MCwgMjAwKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcig0MjAsIDI5MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKDM2MCwgMjkyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoMzYwLCAxNjYpXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyb3V0ZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXllck9iamVjdC5zZXRNb3ZlbWVudFJvdXRlKHJvdXRlKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyT2JqZWN0LnNldE1vdmVtZW50U3BlZWQoMzApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlSG92ZXIoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgR2xvYmFscy5zZXRDdXJyZW50TW91c2VQb3ModGhpcy5nZXRSZWxNb3VzZVBvcyhldmVudCkpO1xuICAgIH1cblxuICAgIGdldE1vdXNlUG9zKGV2ZW50OiBNb3VzZUV2ZW50KTogVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IoZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0cnVlIGlmIHRoZSAocmVsYXRpdmUpIGNvb3JkaW5hdGVzIGFyZSB3aXRoaW4gdGhlIGdpdmVuIHpvbmUuXG4gICAgaXNXaXRoaW5JbnRlcmFjdGl2ZU9iamVjdChwb3M6IFZlY3RvciwgaU9iajogSW50ZXJhY3RpdmVPYmplY3QpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHBvcy54ID4gaU9iai5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yICYmIHBvcy54IDwgaU9iai5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yICsgaU9iai53aWR0aCAqIHRoaXMuc2l6ZUZhY3Rvcikge1xuICAgICAgICAgICAgaWYgKHBvcy55ID4gaU9iai5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yICYmIHBvcy55IDwgaU9iai5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yICsgaU9iai5oZWlnaHQgKiB0aGlzLnNpemVGYWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0UmVsTW91c2VQb3MoZXZlbnQ6IE1vdXNlRXZlbnQpOiBWZWN0b3Ige1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgVmVjdG9yKFxuICAgICAgICAgICAgZXZlbnQub2Zmc2V0WCxcbiAgICAgICAgICAgIGV2ZW50Lm9mZnNldFlcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHBvc1xuICAgIH1cblxuICAgIGNsZWFyU2NyZWVuKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnN0YXRpY0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgICAgIHRoaXMuZHluYW1pY0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgfVxuXG4gICAgZGVmU3RhdGljTGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIC8vIGdldCBjYW52YXNcbiAgICAgICAgY29uc3Qgc3RhQ2FudmFzOiBIVE1MRWxlbWVudHxudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xheWVyMScpO1xuICAgICAgICBpZihzdGFDYW52YXMpIHRoaXMuc3RhdGljQ2FudmFzID0gc3RhQ2FudmFzIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdGF0aWMgY2FudmFzIGVsZW1lbnQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aDtcbiAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMuaGVpZ2h0ID0gdGhpcy5yZWFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIGdldCBjdHhcbiAgICAgICAgY29uc3QgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR8bnVsbCA9XG4gICAgICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuc3RhdGljQ3R4ID0gY3R4IGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3RhdGljIGNvbnRleHQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgLy8gZGlzYWJsZSBzbW9vdGhpbmcgb3V0IHBpeGVsc1xuICAgICAgICB0aGlzLnN0YXRpY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZVN0YXRpY0xheWVyKCkge1xuICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy53aWR0aCA9IHRoaXMucmVhbFdpZHRoO1xuICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmKGN0eCkgdGhpcy5zdGF0aWNDdHggPSBjdHggYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdGF0aWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuc3RhdGljQ3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRyYXdTdGF0aWNMYXllcigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5zdGF0aWNDdHg7XG4gICAgICAgIGNvbnN0IHJlbmRlciA9IG5ldyBJbWFnZSgpO1xuICAgICAgICByZW5kZXIuc3JjID0gQ2xhc3Nyb29tUmVuZGVyO1xuICAgICAgICBjdHguZHJhd0ltYWdlKHJlbmRlciwgdGhpcy5sZWZ0LCB0aGlzLnRvcCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWZEeW5hbWljTGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIC8vIGdldCBjYW52YXNcbiAgICAgICAgY29uc3QgZHluQ2FudmFzOiBIVE1MRWxlbWVudHxudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xheWVyMicpO1xuICAgICAgICBpZihkeW5DYW52YXMpIHRoaXMuZHluYW1pY0NhbnZhcyA9IGR5bkNhbnZhcyBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRHluYW1pYyBjYW52YXMgZWxlbWVudCB3YXMgbnVsbCFcIilcblxuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aDtcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLmhlaWdodCA9IHRoaXMucmVhbEhlaWdodDtcblxuICAgICAgICAvLyByZWdpc3RlciBpbnRlcmFjdGlvbiBldmVudHNcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLm9uY2xpY2sgPSB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVIb3ZlcihlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuZHluYW1pY0N0eCA9IGN0eCBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkR5bmFtaWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuZHluYW1pY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZUR5bmFtaWNMYXllcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLndpZHRoID0gdGhpcy5yZWFsV2lkdGg7XG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuZHluYW1pY0N0eCA9IGN0eCBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkR5bmFtaWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuZHluYW1pY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkcmF3RHluYW1pY0xheWVyKCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmR5bmFtaWNDdHg7XG5cbiAgICAgICAgIC8vIHRoaXMgaGFzIHRvIGJlIGRvbmUgdHdvIHRpbWVzIHNvIGkgcGFja2FnZWQgaXQgaW4gYSBmdW5jXG4gICAgICAgIGZ1bmN0aW9uIGRyYXdEeW5PYmooc2NlbmU6IFNjZW5lKTogdm9pZCB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGR5bk9iaiBvZiBzY2VuZS5keW5hbWljT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGR5bk9iai5kcmF3KGN0eCwgc2NlbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGlnaHQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgbGlnaHQuc3JjID0gQ2xhc3Nyb29tTGlnaHQ7XG4gICAgICAgIGRyYXdEeW5PYmoodGhpcyk7XG4gICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc29mdC1saWdodCc7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UobGlnaHQsIHRoaXMubGVmdCwgdGhpcy50b3AsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NjcmVlbic7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UobGlnaHQsIHRoaXMubGVmdCwgdGhpcy50b3AsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLWF0b3AnO1xuICAgICAgICBkcmF3RHluT2JqKHRoaXMpO1xuXG4gICAgICAgIGlmIChHbG9iYWxzLkRFQlVHKSB7XG4gICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICAgICAgICAgIGZvciAoY29uc3QgaU9iaiBvZiB0aGlzLmludGVyYWN0aXZlT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93JztcblxuICAgICAgICAgICAgICAgIC8vIG1hcmsgaG92ZXJlZCBvYmplY3RzIGluIHJlZFxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJNb3VzZVBvczogVmVjdG9yID0gR2xvYmFscy5nZXRDdXJyZW50TW91c2VQb3MoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1dpdGhpbkludGVyYWN0aXZlT2JqZWN0KGN1cnJNb3VzZVBvcyxpT2JqKSlcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG5cbiAgICAgICAgICAgICAgICBjdHgucmVjdChcbiAgICAgICAgICAgICAgICAgICAgaU9iai5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBpT2JqLnBvc2l0aW9uLnkgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGlPYmoud2lkdGggKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGlPYmouaGVpZ2h0ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWZHYW1lTG9naWMoKTogdm9pZCB7XG4gICAgICAgIC8vIGdldCBzcHJpdGVcbiAgICAgICAgY29uc3QgdXNlckNoYXJhY3RlclNwcml0ZTogSFRNTEltYWdlRWxlbWVudCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB1c2VyQ2hhcmFjdGVyU3ByaXRlLnNyYyA9IEZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdDtcblxuICAgICAgICAvLyBtYWtlIG9iamVjdFxuICAgICAgICBjb25zdCB1c2VyQ2hhcmFjdGVyOiBEeW5hbWljT2JqZWN0ID1cbiAgICAgICAgICAgIG5ldyBEeW5hbWljT2JqZWN0KDMyLCAzMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJDaGFyYWN0ZXJTcHJpdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA4LCA1LjUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbRmVtYWxlc3R1ZGVudHdhbGtpbmdub3J0aCwgRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0LCBGZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoLCBGZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3RdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW0ZlbWFsZXN0dWRlbnR3YWxraW5nbm9ydGgsIEZlbWFsZXN0dWRlbnR3YWxraW5nd2VzdCwgRmVtYWxlc3R1ZGVudHdhbGtpbmdzb3V0aCwgRmVtYWxlc3R1ZGVudHdhbGtpbmdlYXN0XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgdXNlckNoYXJhY3Rlci5zZXRQb3MoNDAwLCA0MDApO1xuXG4gICAgICAgIHRoaXMucGxheWVyT2JqZWN0ID0gdXNlckNoYXJhY3RlcjtcbiAgICAgICAgdGhpcy5keW5hbWljT2JqZWN0cy5wdXNoKHVzZXJDaGFyYWN0ZXIpO1xuXG4gICAgICAgIC8vIGRlZmluZSBjaGFpciB6b25lc1xuICAgICAgICAvLyBmb3IgZWFjaCBjaGFpcjogW3VwcGVyLWxlZnRdLCB3aWR0aCwgaGVpZ2h0XG4gICAgICAgIGNvbnN0IGNoYWlyWm9uZXM6IEFycmF5PFtWZWN0b3IsIG51bWJlciwgbnVtYmVyXT4gPSBbXG4gICAgICAgICAgICAvLyBiYWNrICgzdGgpIHJvd1xuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAyMzcpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAyMDQpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAxNzQpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAxNDIpLCAzNCwgMzBdLFxuICAgICAgICAgICAgLy8gMmQgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgICAgICAvLyAxc3Qgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgem9uZSBvZiBjaGFpclpvbmVzKVxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZU9iamVjdHMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgSW50ZXJhY3RpdmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMF0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMV0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMl0pKTtcbiAgICAgICAgZm9yIChjb25zdCB6b25lIG9mIGNoYWlyWm9uZXMpXG4gICAgICAgICAgICB0aGlzLmNoYWlyWm9uZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgSW50ZXJhY3RpdmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMF0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMV0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMl0pKTtcbiAgICB9XG5cbiAgICBydW5HYW1lTG9vcCgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBvIG9mIHRoaXMuZHluYW1pY09iamVjdHMpIHtcbiAgICAgICAgICAgIG8ubW92ZU9uUm91dGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yJztcbmltcG9ydCBHbG9iYWxzIGZyb20gJy4vR2xvYmFscyc7XG5pbXBvcnQgQ2xhc3Nyb29tU2NlbmUgZnJvbSAnLi9DbGFzc3Jvb21TY2VuZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgR2xvYmFscy5zZXRBY3RpdmVTY2VuZShcbiAgICAgICAgbmV3IENsYXNzcm9vbVNjZW5lKFxuICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQpKTtcblxuICAgIEdsb2JhbHMuc2V0QWN0aXZlQW5pbWF0b3IoXG4gICAgICAgIG5ldyBBbmltYXRvcihcbiAgICAgICAgICAgIEdsb2JhbHMuZ2V0QWN0aXZlU2NlbmUoKSkpO1xuICAgICAgICAgICAgR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmFuaW1hdGUoKTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgY29uc3QgYWN0aXZlU2NlbmUgPSBHbG9iYWxzLmdldEFjdGl2ZVNjZW5lKCk7XG4gICAgaWYgKGFjdGl2ZVNjZW5lICE9IG51bGwpIHtcbiAgICAgICAgYWN0aXZlU2NlbmUucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9