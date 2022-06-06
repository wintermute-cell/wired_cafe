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
    Vector.prototype.toDirectionIndex = function () {
        var result = 0;
        if (Math.abs(this.x) > Math.abs(this.y)) {
            // horizontal axis is stronger
            if (this.x > 0)
                result = 1;
            else
                result = 3;
        }
        else {
            // vertical axis is stronger
            if (this.y > 0)
                result = 2;
            else
                result = 0;
        }
        return result;
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
    function DynamicObject(height, width, sprite, routePosition) {
        this.animationModes = {};
        this.lookDirection = new src_Vector(0, -1); // default south
        this.movementRoute = []; // a list of x, y position objects
        this.stepOfRoute = 0; // an index of the current position in the above route
        this.distToNextPoint = 0;
        // this is used to check when the animate method was last called
        // to prevent double animation calls in one frame
        this.lastTime = 0;
        this.height = height;
        this.width = width;
        this.sprite = sprite;
        this.routePosition = routePosition;
        this.setPos(routePosition.position.x, routePosition.position.y);
        this.movementSpeed = 0;
    }
    DynamicObject.prototype.addAnimationMode = function (name, mode) {
        if (!this.currAnimationMode)
            this.currAnimationMode = mode; // the first assigned animation mode becomes the initial mode
        this.animationModes[name] = mode;
    };
    DynamicObject.prototype.setAnimationMode = function (name) {
        var mode = this.animationModes[name];
        if (mode && this.currAnimationMode !== mode) {
            console.log(name);
            this.currAnimationMode = mode;
        }
    };
    DynamicObject.prototype.setMovementRoute = function (route) {
        if (route.length > 0) {
            this.movementRoute = route;
            this.stepOfRoute = 0;
            this.distToNextPoint = this.position.distanceTo(route[1].position);
            this.routePosition = route[1];
        }
    };
    DynamicObject.prototype.setMovementSpeed = function (speed) {
        this.movementSpeed = speed;
    };
    DynamicObject.prototype.setPos = function (x, y) {
        var adjustedPos = new src_Vector(x, y);
        adjustedPos.x -= this.width / 2;
        adjustedPos.y -= this.height;
        this.position = adjustedPos;
    };
    DynamicObject.prototype.getPos = function () {
        var p = new src_Vector(this.position.x, this.position.y);
        p.x += this.width / 2;
        p.y += this.height;
        return p;
    };
    DynamicObject.prototype.selectSprite = function (direction) {
        //if (direction.x === 0 && direction.y === 0) {
        //  this.sprite = this.spritesIdle[2];
        //} else if (Math.abs(direction.x) > Math.abs(direction.y)) {
        //  // horizontal movement is stronger
        //  if (direction.x > 0) this.sprite = this.spritesWalk[3];
        //  else this.sprite = this.spritesWalk[1];
        //} else {
        //  // vertical movement is stronger
        //  if (direction.y > 0) this.sprite = this.spritesWalk[2];
        //  else this.sprite = this.spritesWalk[0];
        //}
    };
    DynamicObject.prototype.moveOnRoute = function () {
        // if the end of the route has been reached, no movement is required. instead, clear the current route
        if (this.stepOfRoute >= this.movementRoute.length - 1) {
            this.stepOfRoute = 0;
            this.movementRoute = [];
            this.setAnimationMode('idle');
            return;
        }
        else {
            this.setAnimationMode('moving');
            var deltaTime = src_Globals.getActiveAnimator().getDeltaTime(); // will be used a couple of times, so short name is better
            var target = this.movementRoute[this.stepOfRoute + 1].position; // the current next node in the route
            // check if the next step would reach the target
            var lookAheadDistance = this.distToNextPoint - (this.movementSpeed * deltaTime);
            if (lookAheadDistance <= 0) {
                this.setPos(target.x, target.y);
                this.stepOfRoute++;
                // prepare for the next part of the route
                if (this.stepOfRoute < this.movementRoute.length - 1) {
                    this.routePosition = this.movementRoute[this.stepOfRoute + 1]; // the route position is always the target of the walk
                    this.distToNextPoint = this.position.distanceTo(this.routePosition.position);
                }
                return;
            }
            else {
                // since this step will not reach the target, just move as expected
                var currPos = this.getPos();
                var direction = new src_Vector(target.x - currPos.x, target.y - currPos.y);
                // normalizing the direction vector
                var nDirection = direction.normalized();
                this.lookDirection = nDirection;
                var p = this.getPos();
                this.setPos(p.x + nDirection.x * deltaTime * this.movementSpeed, p.y + nDirection.y * deltaTime * this.movementSpeed);
                this.distToNextPoint = p.distanceTo(target);
            }
        }
    };
    DynamicObject.prototype.animate = function () {
        if (Object.keys(this.animationModes).length <= 0) {
            console.log("Tried to animate dynamic object without any assigned animationModes!");
            return;
        }
        // prevent animation from progressing multiple times each frame
        // if the obj is rendered multiple times by comparing the last timestamp with the current one
        if (this.lastTime !== src_Globals.getActiveAnimator().currTime) {
            this.currAnimationMode.animationStep +=
                src_Globals.getActiveAnimator().getDeltaTime() * this.currAnimationMode.animationSpeed;
            if (this.currAnimationMode.animationStep > this.currAnimationMode.animationFrames)
                this.currAnimationMode.animationStep = 0; // loop
        }
        this.lastTime = src_Globals.getActiveAnimator().currTime;
    };
    DynamicObject.prototype.draw = function (ctx, scene) {
        ctx.drawImage(this.currAnimationMode.spriteSets[this.lookDirection.toDirectionIndex()], Math.floor(this.currAnimationMode.animationStep) * this.width, 0, 32, 32, this.position.x * scene.sizeFactor, this.position.y * scene.sizeFactor, this.height * scene.sizeFactor, this.width * scene.sizeFactor);
        this.animate();
    };
    return DynamicObject;
}());
/* harmony default export */ const src_DynamicObject = (DynamicObject);

;// CONCATENATED MODULE: ./src/AnimationMode.ts
var AnimationMode = /** @class */ (function () {
    function AnimationMode(spriteSets, animationFrames, animationSpeed) {
        this.currDirection = 2; // default south facing
        this.animationStep = 0; // current animation frame of the sprite-sheet
        this.spriteSets = spriteSets;
        this.animationFrames = animationFrames;
        this.animationSpeed = animationSpeed;
    }
    return AnimationMode;
}());
/* harmony default export */ const src_AnimationMode = (AnimationMode);

;// CONCATENATED MODULE: ./src/Helper.ts
var Helper = /** @class */ (function () {
    function Helper() {
    }
    Helper.PathToImg = function (path) {
        var img = new Image();
        img.src = path;
        return img;
    };
    Helper.PathsToImgs = function (paths) {
        var imgs = [];
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var path = paths_1[_i];
            var img = new Image();
            img.src = path;
            imgs.push(img);
        }
        return imgs;
    };
    return Helper;
}());
/* harmony default export */ const src_Helper = (Helper);

;// CONCATENATED MODULE: ./src/RouteGraph.ts
var RouteGraph = /** @class */ (function () {
    function RouteGraph(nodes) {
        this.nodes = nodes;
    }
    // get the closest node in the graph to a given arbitrary position on the screen
    RouteGraph.prototype.getClosestNodeTo = function (position) {
        var closest = this.nodes[0];
        var minDist = this.nodes[0].position.distanceTo(position);
        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            var d = node.position.distanceTo(position);
            if (d < minDist) {
                minDist = d;
                closest = node;
            }
        }
        return closest;
    };
    // shitty randomized routing algo. doesnt find shortest route, but provides variety
    RouteGraph.prototype.getRoute = function (from, to) {
        if (from === to) {
            return [];
        }
        var currentNode = from;
        var currRoute = [from];
        var visitedNodes = [from];
        while (currentNode !== to) { // if target is reached, end the search
            var collapse = false;
            for (var i = 0, len = currentNode.neighbours.length; i < len; i++) {
                var n = currentNode.neighbours[i];
                if (!visitedNodes.includes(n)) {
                    currentNode = n;
                    break;
                }
                else if (i === len - 1) {
                    currentNode = currRoute[currRoute.length - 2];
                    currRoute.pop();
                    collapse = true;
                }
            }
            if (!collapse) {
                currRoute.push(currentNode);
                visitedNodes.push(currentNode);
            }
        }
        return currRoute;
    };
    return RouteGraph;
}());
/* harmony default export */ const src_RouteGraph = (RouteGraph);

;// CONCATENATED MODULE: ./src/WVector.ts
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

// world space vector
var WVector = /** @class */ (function (_super) {
    __extends(WVector, _super);
    function WVector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return WVector;
}(src_Vector));
/* harmony default export */ const src_WVector = (WVector);

;// CONCATENATED MODULE: ./src/RouteNode.ts

var RouteNode = /** @class */ (function () {
    function RouteNode(x, y) {
        this.position = new src_WVector(x, y);
        this.neighbours = [];
    }
    RouteNode.prototype.addNeighbour = function (n) {
        this.neighbours.push(n);
    };
    // addNeighbour in both directions
    RouteNode.prototype.addBidNeighbour = function (n) {
        this.neighbours.push(n);
        n.neighbours.push(this);
    };
    return RouteNode;
}());
/* harmony default export */ const src_RouteNode = (RouteNode);

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
var Femalestudentidleeast = '../resources/characters/female_student/Femalestudentidleeast-sheet.png';
var Femalestudentidlenorth = '../resources/characters/female_student/Femalestudentidlenorth-sheet.png';
var Femalestudentidlesouth = '../resources/characters/female_student/Femalestudentidlesouth-sheet.png';
var Femalestudentidlewest = '../resources/characters/female_student/Femalestudentidlewest-sheet.png';
var Femalestudentsitting = '../resources/characters/female_student/Femalestudentsitting.png';
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
        this.resizeStaticLayer();
        this.resizeDynamicLayer();
    };
    ClassroomScene.prototype.handleClick = function (event) {
        var mousePos = this.getRelMousePos(event);
        if (src_Globals.DEBUG)
            console.log(mousePos);
        for (var i = 0; i < this.chairZones.length; i++) {
            var chair = this.chairZones[i];
            if (this.isWithinInteractiveObject(mousePos, chair)) {
                if (true) { // TODO: if server says the seat is empty
                    this.playerObject.setMovementRoute(this.routeGraph.getRoute(this.playerObject.routePosition, this.routeGraph.getClosestNodeTo(new src_Vector(chair.position.x, (chair.position.y + chair.height))) // use the lower left corner of the chair
                    ));
                }
                break; // no need to look at the other chairs
            }
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
        if (pos.x > iObj.position.x && pos.x < iObj.position.x + iObj.width) {
            if (pos.y > iObj.position.y && pos.y < iObj.position.y + iObj.height) {
                return true;
            }
        }
        return false;
    };
    ClassroomScene.prototype.getRelMousePos = function (event) {
        var pos = new src_Vector(event.offsetX / this.sizeFactor, event.offsetY / this.sizeFactor);
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
        // the ctx has to be fetched again, otherwise the image will get blurry for some reason.
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
        // the ctx has to be fetched again, otherwise the image will get blurry for some reason.
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
            scene.dynamicObjects.sort(function (a, b) { return (a.position.y > b.position.y) ? 1 : -1; }); // render lower positions in front
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
            // draw interactives
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
            // draw route graph
            for (var _b = 0, _c = this.routeGraph.nodes; _b < _c.length; _b++) {
                var node = _c[_b];
                // draw paths to neighburs
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'green';
                for (var _d = 0, _e = node.neighbours; _d < _e.length; _d++) {
                    var n = _e[_d];
                    ctx.beginPath();
                    ctx.moveTo(node.position.x * this.sizeFactor, node.position.y * this.sizeFactor);
                    ctx.lineTo(n.position.x * this.sizeFactor, n.position.y * this.sizeFactor);
                    ctx.stroke();
                }
                // draw nodes
                ctx.beginPath();
                ctx.fillStyle = 'green';
                ctx.fillRect((node.position.x * this.sizeFactor) - 3 * this.sizeFactor, node.position.y * this.sizeFactor - 3 * this.sizeFactor, 6 * this.sizeFactor, 6 * this.sizeFactor);
                ctx.stroke();
            }
            // draw dynamics
            for (var _f = 0, _g = this.dynamicObjects; _f < _g.length; _f++) {
                var dynObj = _g[_f];
                ctx.beginPath();
                ctx.fillStyle = 'blue';
                var p = dynObj.getPos();
                ctx.fillRect(p.x * this.sizeFactor, p.y * this.sizeFactor, 3 * this.sizeFactor, 3 * this.sizeFactor);
                ctx.stroke();
                // draw routing information
                for (var i = 0, len = dynObj.movementRoute.length; i < len; i++) {
                    var node = dynObj.movementRoute[i];
                    ctx.beginPath();
                    ctx.fillStyle = 'purple';
                    ctx.fillRect(node.position.x * this.sizeFactor, node.position.y * this.sizeFactor, 4 * this.sizeFactor, 4 * this.sizeFactor);
                    ctx.stroke();
                    var nextNode = dynObj.movementRoute[i + 1];
                    ctx.strokeStyle = 'purple';
                    if (nextNode === dynObj.routePosition)
                        ctx.strokeStyle = 'lightblue';
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
    };
    ClassroomScene.prototype.createRouteGraph = function () {
        var nodes = [];
        // create new node and add to list
        function nn(x, y) {
            var n = new src_RouteNode(x, y);
            nodes.push(n);
            return n;
        }
        // bottom of screen, door and below rows
        var at_door = nn(418, 286);
        var below_first_row = nn(358, 286);
        at_door.addBidNeighbour(below_first_row);
        var below_sec_row = nn(294, 286);
        below_first_row.addBidNeighbour(below_sec_row);
        var below_thrd_row = nn(230, 286);
        below_sec_row.addBidNeighbour(below_thrd_row);
        // first row
        var fr_first = nn(358, 263);
        var fr_sec = nn(358, 231);
        var fr_thrd = nn(358, 199);
        var fr_frth = nn(358, 167);
        var fr_first_chair = nn(370, 263);
        var fr_sec_chair = nn(370, 231);
        var fr_thrd_chair = nn(370, 199);
        var fr_frth_chair = nn(370, 167);
        below_first_row.addBidNeighbour(fr_first);
        fr_first.addBidNeighbour(fr_sec);
        fr_sec.addBidNeighbour(fr_thrd);
        fr_thrd.addBidNeighbour(fr_frth);
        fr_first.addBidNeighbour(fr_first_chair);
        fr_sec.addBidNeighbour(fr_sec_chair);
        fr_thrd.addBidNeighbour(fr_thrd_chair);
        fr_frth.addBidNeighbour(fr_frth_chair);
        // second row
        var sc_first = nn(294, 263);
        var sc_sec = nn(294, 231);
        var sc_thrd = nn(294, 199);
        var sc_frth = nn(294, 167);
        var sc_first_chair = nn(306, 263);
        var sc_sec_chair = nn(306, 231);
        var sc_thrd_chair = nn(306, 199);
        var sc_frth_chair = nn(306, 167);
        below_sec_row.addBidNeighbour(sc_first);
        sc_first.addBidNeighbour(sc_sec);
        sc_sec.addBidNeighbour(sc_thrd);
        sc_thrd.addBidNeighbour(sc_frth);
        sc_first.addBidNeighbour(sc_first_chair);
        sc_sec.addBidNeighbour(sc_sec_chair);
        sc_thrd.addBidNeighbour(sc_thrd_chair);
        sc_frth.addBidNeighbour(sc_frth_chair);
        // third row
        var th_first = nn(230, 263);
        var th_sec = nn(230, 231);
        var th_thrd = nn(230, 199);
        var th_frth = nn(230, 167);
        var th_first_chair = nn(242, 263);
        var th_sec_chair = nn(242, 231);
        var th_thrd_chair = nn(242, 199);
        var th_frth_chair = nn(242, 167);
        below_thrd_row.addBidNeighbour(th_first);
        th_first.addBidNeighbour(th_sec);
        th_sec.addBidNeighbour(th_thrd);
        th_thrd.addBidNeighbour(th_frth);
        th_first.addBidNeighbour(th_first_chair);
        th_sec.addBidNeighbour(th_sec_chair);
        th_thrd.addBidNeighbour(th_thrd_chair);
        th_frth.addBidNeighbour(th_frth_chair);
        // add all the nodes to the scenes graph
        this.routeGraph = new src_RouteGraph(nodes);
    };
    ClassroomScene.prototype.createPlayer = function () {
        // get sprite
        var userCharacterSprite = new Image();
        userCharacterSprite.src = Femalestudentwalkingeast;
        var userCharacter = new src_DynamicObject(32, 32, userCharacterSprite, this.routeGraph.nodes[0]);
        userCharacter.setMovementSpeed(30);
        userCharacter.addAnimationMode('moving', new src_AnimationMode(src_Helper.PathsToImgs([Femalestudentwalkingnorth, Femalestudentwalkingeast, Femalestudentwalkingsouth, Femalestudentwalkingwest]), 8, 5.5));
        userCharacter.addAnimationMode('idle', new src_AnimationMode(// TODO: put actual idle animations here goddamn
        src_Helper.PathsToImgs([Femalestudentidlenorth, Femalestudentidleeast, Femalestudentidlesouth, Femalestudentidlewest]), 1, 5.5));
        userCharacter.addAnimationMode('sitting', new src_AnimationMode(// TODO: make directional sitting animations
        src_Helper.PathsToImgs([Femalestudentsitting, Femalestudentsitting, Femalestudentsitting, Femalestudentsitting]), 1, 0));
        this.playerObject = userCharacter;
        this.dynamicObjects.push(userCharacter);
    };
    ClassroomScene.prototype.defGameLogic = function () {
        this.createRouteGraph();
        this.createPlayer();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QixDQUNqQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQTtJQUMxQixDQUFDO0lBRUQsb0NBQVcsR0FBWDtRQUNJLEtBQWdCLFVBQW1CLEVBQW5CLFNBQUksQ0FBQyxjQUFjLEVBQW5CLGNBQW1CLEVBQW5CLElBQW1CLEVBQUU7WUFBaEMsSUFBTSxDQUFDO1lBQ1IsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FBQzs7OztBQy9nQmlDO0FBQ0Y7QUFDYztBQUU5QyxNQUFNLENBQUMsTUFBTSxHQUFHO0lBQ1osMEJBQXNCLENBQ2xCLElBQUksa0JBQWMsQ0FDZCxNQUFNLENBQUMsVUFBVSxFQUNqQixNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUU3Qiw2QkFBeUIsQ0FDckIsSUFBSSxZQUFRLENBQ1IsMEJBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0IsNkJBQXlCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsRCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO0lBQzlCLElBQU0sV0FBVyxHQUFHLDBCQUFzQixFQUFFLENBQUM7SUFDN0MsSUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO1FBQ3JCLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0Q7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9BbmltYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvVmVjdG9yLnRzIiwid2VicGFjazovLy8uL3NyYy9HbG9iYWxzLnRzIiwid2VicGFjazovLy8uL3NyYy9JbnRlcmFjdGl2ZU9iamVjdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvRHluYW1pY09iamVjdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvQW5pbWF0aW9uTW9kZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvSGVscGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9Sb3V0ZUdyYXBoLnRzIiwid2VicGFjazovLy8uL3NyYy9XVmVjdG9yLnRzIiwid2VicGFjazovLy8uL3NyYy9Sb3V0ZU5vZGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0NsYXNzcm9vbVNjZW5lLnRzIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5pbWF0b3Ige1xuICAgIF9zY2VuZTogU2NlbmU7XG4gICAgX2xhc3RUaW1lOiBudW1iZXI7XG4gICAgX2RlbHRhVGltZTogbnVtYmVyO1xuICAgIGN1cnJUaW1lOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBTY2VuZSkge1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2RlbHRhVGltZSA9IDA7XG4gICAgfVxuXG4gICAgX2RyYXdGcmFtZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2NlbmUuZHJhd1N0YXRpY0xheWVyKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmRyYXdEeW5hbWljTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBnZXREZWx0YVRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlbHRhVGltZTtcbiAgICB9XG5cbiAgICBhbmltYXRlKGN1cnJUaW1lOiBudW1iZXIgPSAwKSB7XG4gICAgICAgIHRoaXMuY3VyclRpbWUgPSBjdXJyVGltZTsgLy8gbWFrZSB0aGlzIGF2YWlsYWJsZSBmb3IgdGhlIHNjZW5lXG5cbiAgICAgICAgdGhpcy5fZGVsdGFUaW1lID0gKGN1cnJUaW1lIC0gdGhpcy5fbGFzdFRpbWUpIC8gMTAwMDsgLy8gY29udmVydCBtaWxsaXNlY29uZHMgdG8gc2Vjb25kIGZyYWN0aW9uc1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IGN1cnJUaW1lO1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLnJ1bkdhbWVMb29wKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmNsZWFyU2NyZWVuKCk7XG4gICAgICAgIHRoaXMuX2RyYXdGcmFtZSgpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvciB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICoqIDIgKyB0aGlzLnkgKiogMik7XG4gICAgfVxuXG4gICAgYWRkKG90aGVyOiBWZWN0b3IpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgICAgIHRoaXMueCArIG90aGVyLngsXG4gICAgICAgICAgICB0aGlzLnkgKyBvdGhlci55XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2VUbyhvdGhlcjogVmVjdG9yKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgICAgICAgICh0aGlzLnggLSBvdGhlci54KSAqKiAyICtcbiAgICAgICAgICAgICAgICAodGhpcy55IC0gb3RoZXIueSkgKiogMlxuICAgICAgICApO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZWQoKTogVmVjdG9yIHtcbiAgICAgICAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGgoKTtcbiAgICAgICAgaWYobGVuICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3RvcigwLCAwKTtcbiAgICB9XG5cbiAgICB0b0RpcmVjdGlvbkluZGV4KCk6IG51bWJlciB7XG4gICAgICAgIGxldCByZXN1bHQ6IG51bWJlciA9IDA7XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLngpID4gTWF0aC5hYnModGhpcy55KSkge1xuICAgICAgICAgICAgLy8gaG9yaXpvbnRhbCBheGlzIGlzIHN0cm9uZ2VyXG4gICAgICAgICAgICBpZiAodGhpcy54ID4gMCkgcmVzdWx0ID0gMTtcbiAgICAgICAgICAgIGVsc2UgcmVzdWx0ID0gMztcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdmVydGljYWwgYXhpcyBpcyBzdHJvbmdlclxuICAgICAgICAgICAgaWYgKHRoaXMueSA+IDApIHJlc3VsdCA9IDI7XG4gICAgICAgICAgICBlbHNlIHJlc3VsdCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG4iLCJpbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcbmltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yJztcbmltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2xvYmFscyB7XG4gICAgLy8gY29uZmlnIGZpZWxkc1xuICAgIHN0YXRpYyBERUJVRzogYm9vbGVhbiA9IHRydWU7XG5cbiAgICAvLyBtb3VzZSBwb3NpdGlvblxuICAgIHN0YXRpYyBfY3VycmVudE1vdXNlUG9zaXRpb246IFZlY3RvciA9IG5ldyBWZWN0b3IoMCwgMCk7XG4gICAgc3RhdGljIGdldEN1cnJlbnRNb3VzZVBvcygpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb247XG4gICAgfVxuICAgIHN0YXRpYyBzZXRDdXJyZW50TW91c2VQb3MocG9zOiBWZWN0b3IpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24gPSBwb3M7XG4gICAgfVxuXG4gICAgLy8gYW5pbWF0b3JcbiAgICBzdGF0aWMgX2FjdGl2ZUFuaW1hdG9yOiBBbmltYXRvcjtcbiAgICBzdGF0aWMgZ2V0QWN0aXZlQW5pbWF0b3IoKTogQW5pbWF0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlQW5pbWF0b3I7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRBY3RpdmVBbmltYXRvcihhbmltOiBBbmltYXRvcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9hY3RpdmVBbmltYXRvciA9IGFuaW07XG4gICAgfVxuXG4gICAgLy8gc2NlbmVcbiAgICBzdGF0aWMgX2FjdGl2ZVNjZW5lOiBTY2VuZTtcbiAgICBzdGF0aWMgZ2V0QWN0aXZlU2NlbmUoKTogU2NlbmUge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlU2NlbmU7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRBY3RpdmVTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fYWN0aXZlU2NlbmUgPSBzY2VuZTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmFjdGl2ZU9iamVjdCB7XG4gIHBvc2l0aW9uOiBWZWN0b3I7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0aW5nUG9zOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0aW5nUG9zO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgfVxufVxuIiwiaW1wb3J0IEdsb2JhbHMgZnJvbSAnLi9HbG9iYWxzJztcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuaW1wb3J0IFdWZWN0b3IgZnJvbSAnLi9XVmVjdG9yJztcbmltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcbmltcG9ydCBBbmltYXRpb25Nb2RlIGZyb20gJy4vQW5pbWF0aW9uTW9kZSc7XG5pbXBvcnQgUm91dGVOb2RlIGZyb20gJy4vUm91dGVOb2RlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHluYW1pY09iamVjdCB7XG5cbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG5cbiAgc3ByaXRlOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIGN1cnJBbmltYXRpb25Nb2RlITogQW5pbWF0aW9uTW9kZTtcbiAgYW5pbWF0aW9uTW9kZXM6IHsgW2tleTogc3RyaW5nXTogQW5pbWF0aW9uTW9kZSB9ID0ge307XG4gIGxvb2tEaXJlY3Rpb246IFZlY3RvciA9IG5ldyBWZWN0b3IoMCwgLTEpOyAvLyBkZWZhdWx0IHNvdXRoXG5cbiAgc3ByaXRlU2l0dGluZyE6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgcG9zaXRpb24hOiBXVmVjdG9yOyAvLyBjdXJyZW50IHgsIHkgcG9zaXRpb25cbiAgcm91dGVQb3NpdGlvbjogUm91dGVOb2RlO1xuXG4gIG1vdmVtZW50Um91dGU6IFJvdXRlTm9kZVtdID0gW107IC8vIGEgbGlzdCBvZiB4LCB5IHBvc2l0aW9uIG9iamVjdHNcbiAgc3RlcE9mUm91dGU6IG51bWJlciA9IDA7IC8vIGFuIGluZGV4IG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBhYm92ZSByb3V0ZVxuICBtb3ZlbWVudFNwZWVkOiBudW1iZXI7XG4gIGRpc3RUb05leHRQb2ludDogbnVtYmVyID0gMDtcblxuICAvLyB0aGlzIGlzIHVzZWQgdG8gY2hlY2sgd2hlbiB0aGUgYW5pbWF0ZSBtZXRob2Qgd2FzIGxhc3QgY2FsbGVkXG4gIC8vIHRvIHByZXZlbnQgZG91YmxlIGFuaW1hdGlvbiBjYWxscyBpbiBvbmUgZnJhbWVcbiAgbGFzdFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaGVpZ2h0OiBudW1iZXIsXG4gICAgICAgICAgICAgIHdpZHRoOiBudW1iZXIsXG4gICAgICAgICAgICAgIHNwcml0ZTogSFRNTEltYWdlRWxlbWVudCxcbiAgICAgICAgICAgICAgcm91dGVQb3NpdGlvbjogUm91dGVOb2RlKSB7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuICAgIHRoaXMucm91dGVQb3NpdGlvbiA9IHJvdXRlUG9zaXRpb247XG4gICAgdGhpcy5zZXRQb3Mocm91dGVQb3NpdGlvbi5wb3NpdGlvbi54LCByb3V0ZVBvc2l0aW9uLnBvc2l0aW9uLnkpXG4gICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMDtcbiAgfVxuXG4gIGFkZEFuaW1hdGlvbk1vZGUobmFtZTogc3RyaW5nLCBtb2RlOiBBbmltYXRpb25Nb2RlKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJBbmltYXRpb25Nb2RlKSB0aGlzLmN1cnJBbmltYXRpb25Nb2RlID0gbW9kZTsgLy8gdGhlIGZpcnN0IGFzc2lnbmVkIGFuaW1hdGlvbiBtb2RlIGJlY29tZXMgdGhlIGluaXRpYWwgbW9kZVxuICAgIHRoaXMuYW5pbWF0aW9uTW9kZXNbbmFtZV0gPSBtb2RlO1xuICB9XG5cbiAgc2V0QW5pbWF0aW9uTW9kZShuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBtb2RlOiBBbmltYXRpb25Nb2RlID0gdGhpcy5hbmltYXRpb25Nb2Rlc1tuYW1lXTtcbiAgICBpZiAobW9kZSAmJiB0aGlzLmN1cnJBbmltYXRpb25Nb2RlICE9PSBtb2RlKSB7XG4gICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICAgIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUgPSBtb2RlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1vdmVtZW50Um91dGUocm91dGU6IFJvdXRlTm9kZVtdKSB7XG4gICAgaWYgKHJvdXRlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMubW92ZW1lbnRSb3V0ZSA9IHJvdXRlO1xuICAgICAgdGhpcy5zdGVwT2ZSb3V0ZSA9IDA7XG4gICAgICB0aGlzLmRpc3RUb05leHRQb2ludCA9IHRoaXMucG9zaXRpb24uZGlzdGFuY2VUbyhyb3V0ZVsxXS5wb3NpdGlvbik7XG4gICAgICB0aGlzLnJvdXRlUG9zaXRpb24gPSByb3V0ZVsxXTtcbiAgICB9XG4gIH1cblxuICBzZXRNb3ZlbWVudFNwZWVkKHNwZWVkOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSBzcGVlZDtcbiAgfVxuXG4gIHNldFBvcyh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGFkanVzdGVkUG9zOiBWZWN0b3IgPSBuZXcgVmVjdG9yKHgsIHkpO1xuICAgIGFkanVzdGVkUG9zLnggLT0gdGhpcy53aWR0aCAvIDI7XG4gICAgYWRqdXN0ZWRQb3MueSAtPSB0aGlzLmhlaWdodDtcbiAgICB0aGlzLnBvc2l0aW9uID0gYWRqdXN0ZWRQb3M7XG4gIH1cblxuICBnZXRQb3MoKTogVmVjdG9yIHtcbiAgICBjb25zdCBwID0gbmV3IFZlY3Rvcih0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gICAgcC54ICs9IHRoaXMud2lkdGggLyAyO1xuICAgIHAueSArPSB0aGlzLmhlaWdodDtcbiAgICByZXR1cm4gcFxuICB9XG5cbiAgc2VsZWN0U3ByaXRlKGRpcmVjdGlvbjogVmVjdG9yKTogdm9pZCB7XG4gICAgLy9pZiAoZGlyZWN0aW9uLnggPT09IDAgJiYgZGlyZWN0aW9uLnkgPT09IDApIHtcbiAgICAvLyAgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNJZGxlWzJdO1xuICAgIC8vfSBlbHNlIGlmIChNYXRoLmFicyhkaXJlY3Rpb24ueCkgPiBNYXRoLmFicyhkaXJlY3Rpb24ueSkpIHtcbiAgICAvLyAgLy8gaG9yaXpvbnRhbCBtb3ZlbWVudCBpcyBzdHJvbmdlclxuICAgIC8vICBpZiAoZGlyZWN0aW9uLnggPiAwKSB0aGlzLnNwcml0ZSA9IHRoaXMuc3ByaXRlc1dhbGtbM107XG4gICAgLy8gIGVsc2UgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNXYWxrWzFdO1xuICAgIC8vfSBlbHNlIHtcbiAgICAvLyAgLy8gdmVydGljYWwgbW92ZW1lbnQgaXMgc3Ryb25nZXJcbiAgICAvLyAgaWYgKGRpcmVjdGlvbi55ID4gMCkgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNXYWxrWzJdO1xuICAgIC8vICBlbHNlIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzV2Fsa1swXTtcbiAgICAvL31cbiAgfVxuXG4gIG1vdmVPblJvdXRlKCk6IHZvaWQge1xuICAgIC8vIGlmIHRoZSBlbmQgb2YgdGhlIHJvdXRlIGhhcyBiZWVuIHJlYWNoZWQsIG5vIG1vdmVtZW50IGlzIHJlcXVpcmVkLiBpbnN0ZWFkLCBjbGVhciB0aGUgY3VycmVudCByb3V0ZVxuICAgIGlmICh0aGlzLnN0ZXBPZlJvdXRlID49IHRoaXMubW92ZW1lbnRSb3V0ZS5sZW5ndGgtMSkge1xuICAgICAgdGhpcy5zdGVwT2ZSb3V0ZSA9IDA7XG4gICAgICB0aGlzLm1vdmVtZW50Um91dGUgPSBbXTtcbiAgICAgIHRoaXMuc2V0QW5pbWF0aW9uTW9kZSgnaWRsZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEFuaW1hdGlvbk1vZGUoJ21vdmluZycpO1xuICAgICAgY29uc3QgZGVsdGFUaW1lOiBudW1iZXIgPSBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuZ2V0RGVsdGFUaW1lKCk7IC8vIHdpbGwgYmUgdXNlZCBhIGNvdXBsZSBvZiB0aW1lcywgc28gc2hvcnQgbmFtZSBpcyBiZXR0ZXJcbiAgICAgIGNvbnN0IHRhcmdldDogV1ZlY3RvciA9IHRoaXMubW92ZW1lbnRSb3V0ZVt0aGlzLnN0ZXBPZlJvdXRlICsgMV0ucG9zaXRpb247ICAvLyB0aGUgY3VycmVudCBuZXh0IG5vZGUgaW4gdGhlIHJvdXRlXG5cbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBuZXh0IHN0ZXAgd291bGQgcmVhY2ggdGhlIHRhcmdldFxuICAgICAgY29uc3QgbG9va0FoZWFkRGlzdGFuY2UgPSB0aGlzLmRpc3RUb05leHRQb2ludCAtICh0aGlzLm1vdmVtZW50U3BlZWQgKiBkZWx0YVRpbWUpO1xuICAgICAgaWYgKGxvb2tBaGVhZERpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgdGhpcy5zZXRQb3ModGFyZ2V0LngsIHRhcmdldC55KTtcbiAgICAgICAgdGhpcy5zdGVwT2ZSb3V0ZSsrO1xuXG4gICAgICAgIC8vIHByZXBhcmUgZm9yIHRoZSBuZXh0IHBhcnQgb2YgdGhlIHJvdXRlXG4gICAgICAgIGlmICh0aGlzLnN0ZXBPZlJvdXRlIDwgdGhpcy5tb3ZlbWVudFJvdXRlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnJvdXRlUG9zaXRpb24gPSB0aGlzLm1vdmVtZW50Um91dGVbdGhpcy5zdGVwT2ZSb3V0ZSsxXTsgLy8gdGhlIHJvdXRlIHBvc2l0aW9uIGlzIGFsd2F5cyB0aGUgdGFyZ2V0IG9mIHRoZSB3YWxrXG4gICAgICAgICAgdGhpcy5kaXN0VG9OZXh0UG9pbnQgPSB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlVG8odGhpcy5yb3V0ZVBvc2l0aW9uLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNpbmNlIHRoaXMgc3RlcCB3aWxsIG5vdCByZWFjaCB0aGUgdGFyZ2V0LCBqdXN0IG1vdmUgYXMgZXhwZWN0ZWRcbiAgICAgICAgY29uc3QgY3VyclBvczogV1ZlY3RvciA9IHRoaXMuZ2V0UG9zKCk7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IG5ldyBWZWN0b3IoXG4gICAgICAgICAgdGFyZ2V0LnggLSBjdXJyUG9zLngsXG4gICAgICAgICAgdGFyZ2V0LnkgLSBjdXJyUG9zLnksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gbm9ybWFsaXppbmcgdGhlIGRpcmVjdGlvbiB2ZWN0b3JcbiAgICAgICAgY29uc3QgbkRpcmVjdGlvbjogVmVjdG9yID0gZGlyZWN0aW9uLm5vcm1hbGl6ZWQoKTtcbiAgICAgICAgdGhpcy5sb29rRGlyZWN0aW9uID0gbkRpcmVjdGlvbjtcblxuICAgICAgICBjb25zdCBwOiBXVmVjdG9yID0gdGhpcy5nZXRQb3MoKTtcbiAgICAgICAgdGhpcy5zZXRQb3MoXG4gICAgICAgICAgcC54ICsgbkRpcmVjdGlvbi54ICogZGVsdGFUaW1lICogdGhpcy5tb3ZlbWVudFNwZWVkLFxuICAgICAgICAgIHAueSArIG5EaXJlY3Rpb24ueSAqIGRlbHRhVGltZSAqIHRoaXMubW92ZW1lbnRTcGVlZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5kaXN0VG9OZXh0UG9pbnQgPSBwLmRpc3RhbmNlVG8odGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhbmltYXRlKCk6IHZvaWQge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmFuaW1hdGlvbk1vZGVzKS5sZW5ndGggPD0gMCkge1xuICAgICAgY29uc29sZS5sb2coXCJUcmllZCB0byBhbmltYXRlIGR5bmFtaWMgb2JqZWN0IHdpdGhvdXQgYW55IGFzc2lnbmVkIGFuaW1hdGlvbk1vZGVzIVwiKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHByZXZlbnQgYW5pbWF0aW9uIGZyb20gcHJvZ3Jlc3NpbmcgbXVsdGlwbGUgdGltZXMgZWFjaCBmcmFtZVxuICAgIC8vIGlmIHRoZSBvYmogaXMgcmVuZGVyZWQgbXVsdGlwbGUgdGltZXMgYnkgY29tcGFyaW5nIHRoZSBsYXN0IHRpbWVzdGFtcCB3aXRoIHRoZSBjdXJyZW50IG9uZVxuICAgIGlmICh0aGlzLmxhc3RUaW1lICE9PSBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuY3VyclRpbWUpIHtcbiAgICAgIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCArPVxuICAgICAgICAgIEdsb2JhbHMuZ2V0QWN0aXZlQW5pbWF0b3IoKS5nZXREZWx0YVRpbWUoKSAqIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3BlZWQ7XG4gICAgICBpZiAodGhpcy5jdXJyQW5pbWF0aW9uTW9kZS5hbmltYXRpb25TdGVwID4gdGhpcy5jdXJyQW5pbWF0aW9uTW9kZS5hbmltYXRpb25GcmFtZXMpIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCA9IDA7IC8vIGxvb3BcbiAgICB9XG4gICAgdGhpcy5sYXN0VGltZSA9IEdsb2JhbHMuZ2V0QWN0aXZlQW5pbWF0b3IoKS5jdXJyVGltZTtcbiAgfVxuXG4gIGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHNjZW5lOiBTY2VuZSk6IHZvaWQge1xuICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICB0aGlzLmN1cnJBbmltYXRpb25Nb2RlLnNwcml0ZVNldHNbdGhpcy5sb29rRGlyZWN0aW9uLnRvRGlyZWN0aW9uSW5kZXgoKV0sXG4gICAgICBNYXRoLmZsb29yKHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCkgKiB0aGlzLndpZHRoLCAwLFxuICAgICAgMzIsIDMyLFxuICAgICAgdGhpcy5wb3NpdGlvbi54ICogc2NlbmUuc2l6ZUZhY3RvcixcbiAgICAgIHRoaXMucG9zaXRpb24ueSAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgICB0aGlzLmhlaWdodCAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgICB0aGlzLndpZHRoICogc2NlbmUuc2l6ZUZhY3RvcixcbiAgICApO1xuICAgIHRoaXMuYW5pbWF0ZSgpO1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBBbmltYXRpb25Nb2RlIHtcbiAgICAvLyBOLCBXLCBTLCBFXG4gICAgc3ByaXRlU2V0czogSFRNTEltYWdlRWxlbWVudFtdO1xuXG4gICAgY3VyckRpcmVjdGlvbjogbnVtYmVyID0gMjsgLy8gZGVmYXVsdCBzb3V0aCBmYWNpbmdcblxuICAgIGFuaW1hdGlvblN0ZXA6IG51bWJlciA9IDA7IC8vIGN1cnJlbnQgYW5pbWF0aW9uIGZyYW1lIG9mIHRoZSBzcHJpdGUtc2hlZXRcbiAgICBhbmltYXRpb25GcmFtZXM6IG51bWJlcjsgLy8gdG90YWwgYW1vdW50IG9mIGFuaW1hdGlvbiBmcmFtZXMgaW4gc3ByaXRlLXNoZWV0XG4gICAgYW5pbWF0aW9uU3BlZWQ6IG51bWJlcjsgLy8gYW5pbWF0aW9uIGZyYW1lcyBwZXIgc2Vjb25kXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc3ByaXRlU2V0czogSFRNTEltYWdlRWxlbWVudFtdLFxuICAgICAgICBhbmltYXRpb25GcmFtZXM6IG51bWJlciwgYW5pbWF0aW9uU3BlZWQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNwcml0ZVNldHMgPSBzcHJpdGVTZXRzO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lcyA9IGFuaW1hdGlvbkZyYW1lcztcbiAgICAgICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IGFuaW1hdGlvblNwZWVkO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgIHN0YXRpYyBQYXRoVG9JbWcocGF0aDogc3RyaW5nKTogSFRNTEltYWdlRWxlbWVudCB7XG4gICAgICAgIGxldCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLnNyYyA9IHBhdGg7XG4gICAgICAgIHJldHVybiBpbWdcbiAgICB9XG5cbiAgICBzdGF0aWMgUGF0aHNUb0ltZ3MocGF0aHM6IHN0cmluZ1tdKTogSFRNTEltYWdlRWxlbWVudFtdIHtcbiAgICAgICAgbGV0IGltZ3M6IEhUTUxJbWFnZUVsZW1lbnRbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGltZzogSFRNTEltYWdlRWxlbWVudCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHBhdGg7XG4gICAgICAgICAgICBpbWdzLnB1c2goaW1nKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWdzXG4gICAgfVxufVxuIiwiaW1wb3J0IFJvdXRlTm9kZSBmcm9tICcuL1JvdXRlTm9kZSc7XG5pbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm91dGVHcmFwaCB7XG4gICAgbm9kZXM6IFJvdXRlTm9kZVtdO1xuXG4gICAgY29uc3RydWN0b3Iobm9kZXM6IFJvdXRlTm9kZVtdKSB7XG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIGNsb3Nlc3Qgbm9kZSBpbiB0aGUgZ3JhcGggdG8gYSBnaXZlbiBhcmJpdHJhcnkgcG9zaXRpb24gb24gdGhlIHNjcmVlblxuICAgIGdldENsb3Nlc3ROb2RlVG8ocG9zaXRpb246IFZlY3Rvcik6IFJvdXRlTm9kZSB7XG4gICAgICAgIGxldCBjbG9zZXN0OiBSb3V0ZU5vZGUgPSB0aGlzLm5vZGVzWzBdO1xuICAgICAgICBsZXQgbWluRGlzdDogbnVtYmVyID0gdGhpcy5ub2Rlc1swXS5wb3NpdGlvbi5kaXN0YW5jZVRvKHBvc2l0aW9uKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGxldCBkOiBudW1iZXIgPSBub2RlLnBvc2l0aW9uLmRpc3RhbmNlVG8ocG9zaXRpb24pO1xuICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0KSB7XG4gICAgICAgICAgICAgICAgbWluRGlzdCA9IGQ7XG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsb3Nlc3Q7XG4gICAgfVxuXG5cbiAgICAvLyBzaGl0dHkgcmFuZG9taXplZCByb3V0aW5nIGFsZ28uIGRvZXNudCBmaW5kIHNob3J0ZXN0IHJvdXRlLCBidXQgcHJvdmlkZXMgdmFyaWV0eVxuICAgIGdldFJvdXRlKGZyb206IFJvdXRlTm9kZSwgdG86IFJvdXRlTm9kZSk6IFJvdXRlTm9kZVtdIHtcbiAgICAgICAgaWYgKGZyb20gPT09IHRvKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VycmVudE5vZGU6IFJvdXRlTm9kZSA9IGZyb207XG4gICAgICAgIGxldCBjdXJyUm91dGU6IFJvdXRlTm9kZVtdID0gW2Zyb21dO1xuICAgICAgICBsZXQgdmlzaXRlZE5vZGVzOiBSb3V0ZU5vZGVbXSA9IFtmcm9tXTtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnROb2RlICE9PSB0bykgeyAvLyBpZiB0YXJnZXQgaXMgcmVhY2hlZCwgZW5kIHRoZSBzZWFyY2hcbiAgICAgICAgICAgIGxldCBjb2xsYXBzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGN1cnJlbnROb2RlLm5laWdoYm91cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbjogUm91dGVOb2RlID0gY3VycmVudE5vZGUubmVpZ2hib3Vyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoIXZpc2l0ZWROb2Rlcy5pbmNsdWRlcyhuKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSA9IG47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyUm91dGVbY3VyclJvdXRlLmxlbmd0aC0yXTtcbiAgICAgICAgICAgICAgICAgICAgY3VyclJvdXRlLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb2xsYXBzZSkge1xuICAgICAgICAgICAgICAgIGN1cnJSb3V0ZS5wdXNoKGN1cnJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICB2aXNpdGVkTm9kZXMucHVzaChjdXJyZW50Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VyclJvdXRlO1xuICAgIH1cbn1cbiIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuXG4vLyB3b3JsZCBzcGFjZSB2ZWN0b3JcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdWZWN0b3IgZXh0ZW5kcyBWZWN0b3IgeyB9XG4iLCJpbXBvcnQgV1ZlY3RvciBmcm9tICcuL1dWZWN0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3V0ZU5vZGUge1xuICAgIHBvc2l0aW9uOiBXVmVjdG9yO1xuICAgIG5laWdoYm91cnM6IFJvdXRlTm9kZVtdO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBXVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLm5laWdoYm91cnMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGROZWlnaGJvdXIobjogUm91dGVOb2RlKSB7XG4gICAgICAgIHRoaXMubmVpZ2hib3Vycy5wdXNoKG4pO1xuICAgIH1cblxuICAgIC8vIGFkZE5laWdoYm91ciBpbiBib3RoIGRpcmVjdGlvbnNcbiAgICBhZGRCaWROZWlnaGJvdXIobjogUm91dGVOb2RlKSB7XG4gICAgICAgIHRoaXMubmVpZ2hib3Vycy5wdXNoKG4pO1xuICAgICAgICBuLm5laWdoYm91cnMucHVzaCh0aGlzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi9TY2VuZSc7XG5pbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcbmltcG9ydCBJbnRlcmFjdGl2ZU9iamVjdCBmcm9tICcuL0ludGVyYWN0aXZlT2JqZWN0JztcbmltcG9ydCBHbG9iYWxzIGZyb20gJy4vR2xvYmFscyc7XG5pbXBvcnQgRHluYW1pY09iamVjdCBmcm9tICcuL0R5bmFtaWNPYmplY3QnO1xuaW1wb3J0IEFuaW1hdGlvbk1vZGUgZnJvbSAnLi9BbmltYXRpb25Nb2RlJztcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9IZWxwZXInO1xuaW1wb3J0IFJvdXRlR3JhcGggZnJvbSAnLi9Sb3V0ZUdyYXBoJztcbmltcG9ydCBSb3V0ZU5vZGUgZnJvbSAnLi9Sb3V0ZU5vZGUnO1xuXG4vLyByZXNvdXJjZSBwYXRoc1xuLy8gY2xhc3Nyb29tXG5jb25zdCBDbGFzc3Jvb21SZW5kZXI6IHN0cmluZyA9XG4gICAgJy9yZXNvdXJjZXMvc2NlbmVzL2NsYXNzcm9vbS9DbGFzc3Jvb21SZW5kZXIucG5nJztcbmNvbnN0IENsYXNzcm9vbUxpZ2h0OiBzdHJpbmcgPVxuICAgICcvcmVzb3VyY2VzL3NjZW5lcy9jbGFzc3Jvb20vQ2xhc3Nyb29tTGlnaHQucG5nJztcblxuLy8gZmVtYWxlIHN0dWRlbnRcbmNvbnN0IEZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdDogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdC1zaGVldC5wbmcnO1xuY29uc3QgRmVtYWxlc3R1ZGVudHdhbGtpbmdub3J0aDogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnR3YWxraW5nbm9ydGgtc2hlZXQucG5nJztcbmNvbnN0IEZlbWFsZXN0dWRlbnR3YWxraW5nc291dGg6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoLXNoZWV0LnBuZyc7XG5jb25zdCBGZW1hbGVzdHVkZW50d2Fsa2luZ3dlc3Q6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ3dlc3Qtc2hlZXQucG5nJztcblxuY29uc3QgRmVtYWxlc3R1ZGVudGlkbGVlYXN0OiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudGlkbGVlYXN0LXNoZWV0LnBuZyc7XG5jb25zdCBGZW1hbGVzdHVkZW50aWRsZW5vcnRoOiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudGlkbGVub3J0aC1zaGVldC5wbmcnO1xuY29uc3QgRmVtYWxlc3R1ZGVudGlkbGVzb3V0aDogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnRpZGxlc291dGgtc2hlZXQucG5nJztcbmNvbnN0IEZlbWFsZXN0dWRlbnRpZGxld2VzdDogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnRpZGxld2VzdC1zaGVldC5wbmcnO1xuXG5jb25zdCBGZW1hbGVzdHVkZW50c2l0dGluZzogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnRzaXR0aW5nLnBuZydcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFzc3Jvb21TY2VuZSBpbXBsZW1lbnRzIFNjZW5lIHtcbiAgICAvLyB0aGUgc2NlbmVzIGNhbnZhcyBsb2NhdGlvblxuICAgIGxlZnQ6IG51bWJlcjtcbiAgICB0b3A6IG51bWJlcjtcblxuICAgIC8vIHRoZSBzaXplIG9mIHRoZSBhY3R1YWwgYXZhaWxhYmxlIHNjcmVlblxuICAgIHNjcmVlbldpZHRoOiBudW1iZXI7XG4gICAgc2NyZWVuSGVpZ2h0OiBudW1iZXI7XG5cbiAgICAvLyB0aGUgY2FudmFzIGN0eFxuICAgIHN0YXRpY0N0eCE6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBkeW5hbWljQ3R4ITogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG4gICAgc3RhdGljQ2FudmFzITogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgZHluYW1pY0NhbnZhcyE6IEhUTUxDYW52YXNFbGVtZW50O1xuXG4gICAgLy8gdGhlIHBpeGVsIHNpemUgb2YgdGhlIG9yaWdpbmFsIHNjZW5lIGFydFxuICAgIHJlYWRvbmx5IG9yaWdpbmFsV2lkdGg6IG51bWJlciA9IDY4NDtcbiAgICByZWFkb25seSBvcmlnaW5hbEhlaWdodDogbnVtYmVyID0gNDU0O1xuXG4gICAgLy8gdGhlIHNpemUgb2YgdGhlIHNjZW5lIGFydCBhZnRlciBzY2FsaW5nIGhhcyBiZWVuIGFwcGxpZWRcbiAgICByZWFsV2lkdGg6IG51bWJlcjtcbiAgICByZWFsSGVpZ2h0OiBudW1iZXI7XG5cbiAgICAvLyB0aGUgZmFjdG9yIGJ5IHdoaWNoIHRoZSBvcmlnaW5hbCBhcnQgaGFzIHRvIGJlIHNjYWxlZCB0b1xuICAgIC8vIGZpbGwgdGhlIGF2YWlsYWJsZSBzY3JlZW4gc2l6ZS5cbiAgICBzaXplRmFjdG9yOiBudW1iZXI7XG5cbiAgICAvLyBhbiBhZGRpdGlvbmFsIHNjYWxpbmcgZmFjdG9yLCB0aGF0IGNhbiBiZSB1c2VkIHRvXG4gICAgLy8gYXBwbHkgYWRkaXRpb25hbCBzY2FsaW5nXG4gICAgem9vbUZhY3RvcjogbnVtYmVyID0gMS4xO1xuXG4gICAgcGxheWVyT2JqZWN0ITogRHluYW1pY09iamVjdDtcbiAgICBkeW5hbWljT2JqZWN0czogRHluYW1pY09iamVjdFtdID0gW107XG5cbiAgICAvLyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBJbnRlcmFjdGl2ZU9iamVjdHMgaW4gdGhlIHNjZW5lXG4gICAgaW50ZXJhY3RpdmVPYmplY3RzOiBJbnRlcmFjdGl2ZU9iamVjdFtdID0gW107XG5cbiAgICBjaGFpclpvbmVzOiBJbnRlcmFjdGl2ZU9iamVjdFtdID0gW107XG5cbiAgICByb3V0ZUdyYXBoITogUm91dGVHcmFwaDtcblxuICAgIGNvbnN0cnVjdG9yKHNjcmVlbldpZHRoOiBudW1iZXIsIHNjcmVlbkhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMubGVmdCA9IDA7XG4gICAgICAgIHRoaXMudG9wID0gMDtcbiAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCA9IHNjcmVlbldpZHRoO1xuICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCA9IHNjcmVlbkhlaWdodDtcblxuICAgICAgICAvLyBjYWxjdWxhdGUgZmFjdG9yIGJ5IHdoaWNoIG9yaWdpbmFsIGltYWdlIGhlaWdodFxuICAgICAgICAvLyBpcyBzbWFsbGVyIHRoYW4gc2NyZWVuLlxuICAgICAgICB0aGlzLnNpemVGYWN0b3IgPSB0aGlzLnNjcmVlbkhlaWdodCAvIHRoaXMub3JpZ2luYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gYWRqdXN0IHNpemUgdG8gd2lkdGggaWYgYWRqdXN0aW5nIGJ5IGhlaWdodCBkb2Vzbid0IGZpbGwgc2NyZWVuLlxuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yIDwgdGhpcy5zY3JlZW5XaWR0aCkge1xuICAgICAgICAgICAgdGhpcy5zaXplRmFjdG9yID0gdGhpcy5zY3JlZW5XaWR0aCAvIHRoaXMub3JpZ2luYWxXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2l6ZUZhY3RvciAqPSB0aGlzLnpvb21GYWN0b3I7IC8vIGFwcGx5IHpvb21cblxuICAgICAgICAvLyBzY3JvbGwgdGhlIGNhbWVyYSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY2VuZVxuICAgICAgICBjb25zdCBzY195OiBudW1iZXIgPSAodGhpcy5vcmlnaW5hbEhlaWdodCAqXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplRmFjdG9yIC1cbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCkgLyAyO1xuICAgICAgICBjb25zdCBzY194OiBudW1iZXIgPSAodGhpcy5vcmlnaW5hbFdpZHRoICpcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemVGYWN0b3IgLVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuV2lkdGgpIC8gMjtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oc2NfeCwgc2NfeSk7XG4gICAgICAgIH0sIDIpO1xuXG4gICAgICAgIC8vIGFwcGx5IHNpemluZ1xuICAgICAgICB0aGlzLnJlYWxXaWR0aCA9IHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvcjtcbiAgICAgICAgdGhpcy5yZWFsSGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEhlaWdodCAqIHRoaXMuc2l6ZUZhY3RvcjtcblxuICAgICAgICB0aGlzLmRlZlN0YXRpY0xheWVyKCk7XG4gICAgICAgIHRoaXMuZGVmRHluYW1pY0xheWVyKCk7XG4gICAgICAgIHRoaXMuZGVmR2FtZUxvZ2ljKCk7XG4gICAgfVxuXG4gICAgcmVzaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIGZhY3RvciBieSB3aGljaCBvcmlnaW5hbCBpbWFnZSBoZWlnaHQgaXMgc21hbGxlciB0aGFuIHNjcmVlbi5cbiAgICAgICAgdGhpcy5zaXplRmFjdG9yID0gdGhpcy5zY3JlZW5IZWlnaHQgLyB0aGlzLm9yaWdpbmFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIGFkanVzdCBzaXplIHRvIHdpZHRoIGlmIGFkanVzdGluZyBieSBoZWlnaHQgZG9lc24ndCBmaWxsIHNjcmVlbi5cbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvciA8IHRoaXMuc2NyZWVuV2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2l6ZUZhY3RvciA9IHRoaXMuc2NyZWVuV2lkdGggLyB0aGlzLm9yaWdpbmFsV2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNpemVGYWN0b3IgKj0gdGhpcy56b29tRmFjdG9yOyAvLyBhcHBseSB6b29tXG5cbiAgICAgICAgLy8gc2Nyb2xsIHRoZSBjYW1lcmEgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NlbmVcbiAgICAgICAgY29uc3Qgc2NfeSA9ICh0aGlzLm9yaWdpbmFsSGVpZ2h0ICogdGhpcy5zaXplRmFjdG9yIC0gdGhpcy5zY3JlZW5IZWlnaHQpIC8gMjtcbiAgICAgICAgY29uc3Qgc2NfeCA9ICh0aGlzLm9yaWdpbmFsV2lkdGggKiB0aGlzLnNpemVGYWN0b3IgLSB0aGlzLnNjcmVlbldpZHRoKSAvIDI7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKHNjX3gsIHNjX3kpO1xuICAgICAgICB9LCAyKTtcblxuICAgICAgICAvLyBhcHBseSBzaXppbmdcbiAgICAgICAgdGhpcy5yZWFsV2lkdGggPSB0aGlzLm9yaWdpbmFsV2lkdGggKiB0aGlzLnNpemVGYWN0b3I7XG4gICAgICAgIHRoaXMucmVhbEhlaWdodCA9IHRoaXMub3JpZ2luYWxIZWlnaHQgKiB0aGlzLnNpemVGYWN0b3I7XG5cbiAgICAgICAgdGhpcy5yZXNpemVTdGF0aWNMYXllcigpO1xuICAgICAgICB0aGlzLnJlc2l6ZUR5bmFtaWNMYXllcigpO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IG1vdXNlUG9zOiBWZWN0b3IgPSB0aGlzLmdldFJlbE1vdXNlUG9zKGV2ZW50KTtcbiAgICAgICAgaWYgKEdsb2JhbHMuREVCVUcpIGNvbnNvbGUubG9nKG1vdXNlUG9zKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNoYWlyWm9uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYWlyID0gdGhpcy5jaGFpclpvbmVzW2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNXaXRoaW5JbnRlcmFjdGl2ZU9iamVjdChtb3VzZVBvcywgY2hhaXIpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHsgLy8gVE9ETzogaWYgc2VydmVyIHNheXMgdGhlIHNlYXQgaXMgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJPYmplY3Quc2V0TW92ZW1lbnRSb3V0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm91dGVHcmFwaC5nZXRSb3V0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllck9iamVjdC5yb3V0ZVBvc2l0aW9uLCB0aGlzLnJvdXRlR3JhcGguZ2V0Q2xvc2VzdE5vZGVUbyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihjaGFpci5wb3NpdGlvbi54LCAoY2hhaXIucG9zaXRpb24ueStjaGFpci5oZWlnaHQpKSkgLy8gdXNlIHRoZSBsb3dlciBsZWZ0IGNvcm5lciBvZiB0aGUgY2hhaXJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIG5vIG5lZWQgdG8gbG9vayBhdCB0aGUgb3RoZXIgY2hhaXJzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVIb3ZlcihldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBHbG9iYWxzLnNldEN1cnJlbnRNb3VzZVBvcyh0aGlzLmdldFJlbE1vdXNlUG9zKGV2ZW50KSk7XG4gICAgfVxuXG4gICAgZ2V0TW91c2VQb3MoZXZlbnQ6IE1vdXNlRXZlbnQpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcihldmVudC5vZmZzZXRYLCBldmVudC5vZmZzZXRZKTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIHRydWUgaWYgdGhlIChyZWxhdGl2ZSkgY29vcmRpbmF0ZXMgYXJlIHdpdGhpbiB0aGUgZ2l2ZW4gem9uZS5cbiAgICBpc1dpdGhpbkludGVyYWN0aXZlT2JqZWN0KHBvczogVmVjdG9yLCBpT2JqOiBJbnRlcmFjdGl2ZU9iamVjdCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAocG9zLnggPiBpT2JqLnBvc2l0aW9uLnggJiYgcG9zLnggPCBpT2JqLnBvc2l0aW9uLnggKyBpT2JqLndpZHRoKSB7XG4gICAgICAgICAgICBpZiAocG9zLnkgPiBpT2JqLnBvc2l0aW9uLnkgJiYgcG9zLnkgPCBpT2JqLnBvc2l0aW9uLnkgKyBpT2JqLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRSZWxNb3VzZVBvcyhldmVudDogTW91c2VFdmVudCk6IFZlY3RvciB7XG4gICAgICAgIGNvbnN0IHBvcyA9IG5ldyBWZWN0b3IoXG4gICAgICAgICAgICBldmVudC5vZmZzZXRYIC8gdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgZXZlbnQub2Zmc2V0WSAvIHRoaXMuc2l6ZUZhY3RvclxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcG9zXG4gICAgfVxuXG4gICAgY2xlYXJTY3JlZW4oKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc3RhdGljQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnJlYWxXaWR0aCwgdGhpcy5yZWFsSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5keW5hbWljQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnJlYWxXaWR0aCwgdGhpcy5yZWFsSGVpZ2h0KTtcbiAgICB9XG5cbiAgICBkZWZTdGF0aWNMYXllcigpOiB2b2lkIHtcbiAgICAgICAgLy8gZ2V0IGNhbnZhc1xuICAgICAgICBjb25zdCBzdGFDYW52YXM6IEhUTUxFbGVtZW50fG51bGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGF5ZXIxJyk7XG4gICAgICAgIGlmKHN0YUNhbnZhcykgdGhpcy5zdGF0aWNDYW52YXMgPSBzdGFDYW52YXMgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN0YXRpYyBjYW52YXMgZWxlbWVudCB3YXMgbnVsbCFcIilcblxuICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy53aWR0aCA9IHRoaXMucmVhbFdpZHRoO1xuICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmKGN0eCkgdGhpcy5zdGF0aWNDdHggPSBjdHggYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdGF0aWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuc3RhdGljQ3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplU3RhdGljTGF5ZXIoKSB7XG4gICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLndpZHRoID0gdGhpcy5yZWFsV2lkdGg7XG4gICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLmhlaWdodCA9IHRoaXMucmVhbEhlaWdodDtcblxuICAgICAgICAvLyB0aGUgY3R4IGhhcyB0byBiZSBmZXRjaGVkIGFnYWluLCBvdGhlcndpc2UgdGhlIGltYWdlIHdpbGwgZ2V0IGJsdXJyeSBmb3Igc29tZSByZWFzb24uXG4gICAgICAgIC8vIGdldCBjdHhcbiAgICAgICAgY29uc3QgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR8bnVsbCA9XG4gICAgICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuc3RhdGljQ3R4ID0gY3R4IGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3RhdGljIGNvbnRleHQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgLy8gZGlzYWJsZSBzbW9vdGhpbmcgb3V0IHBpeGVsc1xuICAgICAgICB0aGlzLnN0YXRpY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkcmF3U3RhdGljTGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuc3RhdGljQ3R4O1xuICAgICAgICBjb25zdCByZW5kZXIgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgcmVuZGVyLnNyYyA9IENsYXNzcm9vbVJlbmRlcjtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShyZW5kZXIsIHRoaXMubGVmdCwgdGhpcy50b3AsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVmRHluYW1pY0xheWVyKCk6IHZvaWQge1xuICAgICAgICAvLyBnZXQgY2FudmFzXG4gICAgICAgIGNvbnN0IGR5bkNhbnZhczogSFRNTEVsZW1lbnR8bnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXllcjInKTtcbiAgICAgICAgaWYoZHluQ2FudmFzKSB0aGlzLmR5bmFtaWNDYW52YXMgPSBkeW5DYW52YXMgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkR5bmFtaWMgY2FudmFzIGVsZW1lbnQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLndpZHRoID0gdGhpcy5yZWFsV2lkdGg7XG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gcmVnaXN0ZXIgaW50ZXJhY3Rpb24gZXZlbnRzXG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5vbmNsaWNrID0gdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlSG92ZXIoZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGdldCBjdHhcbiAgICAgICAgY29uc3QgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR8bnVsbCA9XG4gICAgICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYoY3R4KSB0aGlzLmR5bmFtaWNDdHggPSBjdHggYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJEeW5hbWljIGNvbnRleHQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgLy8gZGlzYWJsZSBzbW9vdGhpbmcgb3V0IHBpeGVsc1xuICAgICAgICB0aGlzLmR5bmFtaWNDdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVEeW5hbWljTGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy53aWR0aCA9IHRoaXMucmVhbFdpZHRoO1xuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMuaGVpZ2h0ID0gdGhpcy5yZWFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIHRoZSBjdHggaGFzIHRvIGJlIGZldGNoZWQgYWdhaW4sIG90aGVyd2lzZSB0aGUgaW1hZ2Ugd2lsbCBnZXQgYmx1cnJ5IGZvciBzb21lIHJlYXNvbi5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuZHluYW1pY0N0eCA9IGN0eCBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkR5bmFtaWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuZHluYW1pY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkcmF3RHluYW1pY0xheWVyKCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmR5bmFtaWNDdHg7XG5cbiAgICAgICAgIC8vIHRoaXMgaGFzIHRvIGJlIGRvbmUgdHdvIHRpbWVzIHNvIGkgcGFja2FnZWQgaXQgaW4gYSBmdW5jXG4gICAgICAgIGZ1bmN0aW9uIGRyYXdEeW5PYmooc2NlbmU6IFNjZW5lKTogdm9pZCB7XG4gICAgICAgICAgICBzY2VuZS5keW5hbWljT2JqZWN0cy5zb3J0KChhLCBiKSA9PiAoYS5wb3NpdGlvbi55ID4gYi5wb3NpdGlvbi55KSA/IDEgOiAtMSkgLy8gcmVuZGVyIGxvd2VyIHBvc2l0aW9ucyBpbiBmcm9udFxuICAgICAgICAgICAgZm9yIChjb25zdCBkeW5PYmogb2Ygc2NlbmUuZHluYW1pY09iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBkeW5PYmouZHJhdyhjdHgsIHNjZW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxpZ2h0ID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGxpZ2h0LnNyYyA9IENsYXNzcm9vbUxpZ2h0O1xuICAgICAgICBkcmF3RHluT2JqKHRoaXMpO1xuICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvZnQtbGlnaHQnO1xuICAgICAgICBjdHguZHJhd0ltYWdlKGxpZ2h0LCB0aGlzLmxlZnQsIHRoaXMudG9wLCB0aGlzLnJlYWxXaWR0aCwgdGhpcy5yZWFsSGVpZ2h0KTtcbiAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzY3JlZW4nO1xuICAgICAgICBjdHguZHJhd0ltYWdlKGxpZ2h0LCB0aGlzLmxlZnQsIHRoaXMudG9wLCB0aGlzLnJlYWxXaWR0aCwgdGhpcy5yZWFsSGVpZ2h0KTtcbiAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1hdG9wJztcbiAgICAgICAgZHJhd0R5bk9iaih0aGlzKTtcblxuICAgICAgICBpZiAoR2xvYmFscy5ERUJVRykge1xuICAgICAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgICAgICAgICAvLyBkcmF3IGludGVyYWN0aXZlc1xuICAgICAgICAgICAgZm9yIChjb25zdCBpT2JqIG9mIHRoaXMuaW50ZXJhY3RpdmVPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnO1xuXG4gICAgICAgICAgICAgICAgLy8gbWFyayBob3ZlcmVkIG9iamVjdHMgaW4gcmVkXG4gICAgICAgICAgICAgICAgY29uc3QgY3Vyck1vdXNlUG9zOiBWZWN0b3IgPSBHbG9iYWxzLmdldEN1cnJlbnRNb3VzZVBvcygpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzV2l0aGluSW50ZXJhY3RpdmVPYmplY3QoY3Vyck1vdXNlUG9zLGlPYmopKVxuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJztcblxuICAgICAgICAgICAgICAgIGN0eC5yZWN0KFxuICAgICAgICAgICAgICAgICAgICBpT2JqLnBvc2l0aW9uLnggKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGlPYmoucG9zaXRpb24ueSAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgaU9iai53aWR0aCAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgaU9iai5oZWlnaHQgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZHJhdyByb3V0ZSBncmFwaFxuICAgICAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMucm91dGVHcmFwaC5ub2Rlcykge1xuICAgICAgICAgICAgICAgIC8vIGRyYXcgcGF0aHMgdG8gbmVpZ2hidXJzXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZWVuJztcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG4gb2Ygbm9kZS5uZWlnaGJvdXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhub2RlLnBvc2l0aW9uLnggKiB0aGlzLnNpemVGYWN0b3IsIG5vZGUucG9zaXRpb24ueSAqIHRoaXMuc2l6ZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5saW5lVG8obi5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLCBuLnBvc2l0aW9uLnkgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZHJhdyBub2Rlc1xuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2dyZWVuJztcblxuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgKG5vZGUucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3RvcikgLSAzICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnkgKiB0aGlzLnNpemVGYWN0b3IgLSAzICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICA2ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICA2ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRyYXcgZHluYW1pY3NcbiAgICAgICAgICAgIGZvciAoY29uc3QgZHluT2JqIG9mIHRoaXMuZHluYW1pY09iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJztcblxuICAgICAgICAgICAgICAgIGNvbnN0IHA6IFZlY3RvciA9IGR5bk9iai5nZXRQb3MoKTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgIHAueCAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgcC55ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICAzICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICAzICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBkcmF3IHJvdXRpbmcgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZHluT2JqLm1vdmVtZW50Um91dGUubGVuZ3RoOyAgaSA8IGxlbjsgIGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gZHluT2JqLm1vdmVtZW50Um91dGVbaV07XG4gICAgICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdwdXJwbGUnO1xuXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucG9zaXRpb24ueSAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIDQgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICA0ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHROb2RlID0gZHluT2JqLm1vdmVtZW50Um91dGVbaSsxXTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3B1cnBsZSc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Tm9kZSA9PT0gZHluT2JqLnJvdXRlUG9zaXRpb24pIGN0eC5zdHJva2VTdHlsZSA9ICdsaWdodGJsdWUnO1xuICAgICAgICAgICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHgubW92ZVRvKG5vZGUucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3Rvciwgbm9kZS5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5saW5lVG8obmV4dE5vZGUucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3RvciwgbmV4dE5vZGUucG9zaXRpb24ueSAqIHRoaXMuc2l6ZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVSb3V0ZUdyYXBoKCkge1xuICAgICAgICBjb25zdCBub2RlczogUm91dGVOb2RlW10gPSBbXTtcblxuICAgICAgICAvLyBjcmVhdGUgbmV3IG5vZGUgYW5kIGFkZCB0byBsaXN0XG4gICAgICAgIGZ1bmN0aW9uIG5uKHg6IG51bWJlciwgeTogbnVtYmVyKTogUm91dGVOb2RlIHtcbiAgICAgICAgICAgIGxldCBuOiBSb3V0ZU5vZGUgPSBuZXcgUm91dGVOb2RlKHgsIHkpO1xuICAgICAgICAgICAgbm9kZXMucHVzaChuKVxuICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGJvdHRvbSBvZiBzY3JlZW4sIGRvb3IgYW5kIGJlbG93IHJvd3NcbiAgICAgICAgbGV0IGF0X2Rvb3IgPSBubig0MTgsIDI4Nik7XG4gICAgICAgIGxldCBiZWxvd19maXJzdF9yb3cgPSBubigzNTgsIDI4Nik7XG4gICAgICAgIGF0X2Rvb3IuYWRkQmlkTmVpZ2hib3VyKGJlbG93X2ZpcnN0X3Jvdyk7XG5cbiAgICAgICAgbGV0IGJlbG93X3NlY19yb3cgPSBubigyOTQsIDI4Nik7XG4gICAgICAgIGJlbG93X2ZpcnN0X3Jvdy5hZGRCaWROZWlnaGJvdXIoYmVsb3dfc2VjX3Jvdyk7XG5cbiAgICAgICAgbGV0IGJlbG93X3RocmRfcm93ID0gbm4oMjMwLCAyODYpO1xuICAgICAgICBiZWxvd19zZWNfcm93LmFkZEJpZE5laWdoYm91cihiZWxvd190aHJkX3Jvdyk7XG5cbiAgICAgICAgLy8gZmlyc3Qgcm93XG4gICAgICAgIGxldCBmcl9maXJzdCA9IG5uKDM1OCwgMjYzKTtcbiAgICAgICAgbGV0IGZyX3NlYyA9IG5uKDM1OCwgMjMxKTtcbiAgICAgICAgbGV0IGZyX3RocmQgPSBubigzNTgsIDE5OSk7XG4gICAgICAgIGxldCBmcl9mcnRoID0gbm4oMzU4LCAxNjcpO1xuICAgICAgICBsZXQgZnJfZmlyc3RfY2hhaXIgPSBubigzNzAsIDI2Myk7XG4gICAgICAgIGxldCBmcl9zZWNfY2hhaXIgPSBubigzNzAsIDIzMSk7XG4gICAgICAgIGxldCBmcl90aHJkX2NoYWlyID0gbm4oMzcwLCAxOTkpO1xuICAgICAgICBsZXQgZnJfZnJ0aF9jaGFpciA9IG5uKDM3MCwgMTY3KTtcbiAgICAgICAgYmVsb3dfZmlyc3Rfcm93LmFkZEJpZE5laWdoYm91cihmcl9maXJzdCk7XG4gICAgICAgIGZyX2ZpcnN0LmFkZEJpZE5laWdoYm91cihmcl9zZWMpO1xuICAgICAgICBmcl9zZWMuYWRkQmlkTmVpZ2hib3VyKGZyX3RocmQpO1xuICAgICAgICBmcl90aHJkLmFkZEJpZE5laWdoYm91cihmcl9mcnRoKTtcbiAgICAgICAgZnJfZmlyc3QuYWRkQmlkTmVpZ2hib3VyKGZyX2ZpcnN0X2NoYWlyKTtcbiAgICAgICAgZnJfc2VjLmFkZEJpZE5laWdoYm91cihmcl9zZWNfY2hhaXIpO1xuICAgICAgICBmcl90aHJkLmFkZEJpZE5laWdoYm91cihmcl90aHJkX2NoYWlyKTtcbiAgICAgICAgZnJfZnJ0aC5hZGRCaWROZWlnaGJvdXIoZnJfZnJ0aF9jaGFpcik7XG5cbiAgICAgICAgLy8gc2Vjb25kIHJvd1xuICAgICAgICBsZXQgc2NfZmlyc3QgPSBubigyOTQsIDI2Myk7XG4gICAgICAgIGxldCBzY19zZWMgPSBubigyOTQsIDIzMSk7XG4gICAgICAgIGxldCBzY190aHJkID0gbm4oMjk0LCAxOTkpO1xuICAgICAgICBsZXQgc2NfZnJ0aCA9IG5uKDI5NCwgMTY3KTtcbiAgICAgICAgbGV0IHNjX2ZpcnN0X2NoYWlyID0gbm4oMzA2LCAyNjMpO1xuICAgICAgICBsZXQgc2Nfc2VjX2NoYWlyID0gbm4oMzA2LCAyMzEpO1xuICAgICAgICBsZXQgc2NfdGhyZF9jaGFpciA9IG5uKDMwNiwgMTk5KTtcbiAgICAgICAgbGV0IHNjX2ZydGhfY2hhaXIgPSBubigzMDYsIDE2Nyk7XG4gICAgICAgIGJlbG93X3NlY19yb3cuYWRkQmlkTmVpZ2hib3VyKHNjX2ZpcnN0KTtcbiAgICAgICAgc2NfZmlyc3QuYWRkQmlkTmVpZ2hib3VyKHNjX3NlYyk7XG4gICAgICAgIHNjX3NlYy5hZGRCaWROZWlnaGJvdXIoc2NfdGhyZCk7XG4gICAgICAgIHNjX3RocmQuYWRkQmlkTmVpZ2hib3VyKHNjX2ZydGgpO1xuICAgICAgICBzY19maXJzdC5hZGRCaWROZWlnaGJvdXIoc2NfZmlyc3RfY2hhaXIpO1xuICAgICAgICBzY19zZWMuYWRkQmlkTmVpZ2hib3VyKHNjX3NlY19jaGFpcik7XG4gICAgICAgIHNjX3RocmQuYWRkQmlkTmVpZ2hib3VyKHNjX3RocmRfY2hhaXIpO1xuICAgICAgICBzY19mcnRoLmFkZEJpZE5laWdoYm91cihzY19mcnRoX2NoYWlyKTtcblxuICAgICAgICAvLyB0aGlyZCByb3dcbiAgICAgICAgbGV0IHRoX2ZpcnN0ID0gbm4oMjMwLCAyNjMpO1xuICAgICAgICBsZXQgdGhfc2VjID0gbm4oMjMwLCAyMzEpO1xuICAgICAgICBsZXQgdGhfdGhyZCA9IG5uKDIzMCwgMTk5KTtcbiAgICAgICAgbGV0IHRoX2ZydGggPSBubigyMzAsIDE2Nyk7XG4gICAgICAgIGxldCB0aF9maXJzdF9jaGFpciA9IG5uKDI0MiwgMjYzKTtcbiAgICAgICAgbGV0IHRoX3NlY19jaGFpciA9IG5uKDI0MiwgMjMxKTtcbiAgICAgICAgbGV0IHRoX3RocmRfY2hhaXIgPSBubigyNDIsIDE5OSk7XG4gICAgICAgIGxldCB0aF9mcnRoX2NoYWlyID0gbm4oMjQyLCAxNjcpO1xuICAgICAgICBiZWxvd190aHJkX3Jvdy5hZGRCaWROZWlnaGJvdXIodGhfZmlyc3QpO1xuICAgICAgICB0aF9maXJzdC5hZGRCaWROZWlnaGJvdXIodGhfc2VjKTtcbiAgICAgICAgdGhfc2VjLmFkZEJpZE5laWdoYm91cih0aF90aHJkKTtcbiAgICAgICAgdGhfdGhyZC5hZGRCaWROZWlnaGJvdXIodGhfZnJ0aCk7XG4gICAgICAgIHRoX2ZpcnN0LmFkZEJpZE5laWdoYm91cih0aF9maXJzdF9jaGFpcik7XG4gICAgICAgIHRoX3NlYy5hZGRCaWROZWlnaGJvdXIodGhfc2VjX2NoYWlyKTtcbiAgICAgICAgdGhfdGhyZC5hZGRCaWROZWlnaGJvdXIodGhfdGhyZF9jaGFpcik7XG4gICAgICAgIHRoX2ZydGguYWRkQmlkTmVpZ2hib3VyKHRoX2ZydGhfY2hhaXIpO1xuXG4gICAgICAgIC8vIGFkZCBhbGwgdGhlIG5vZGVzIHRvIHRoZSBzY2VuZXMgZ3JhcGhcbiAgICAgICAgdGhpcy5yb3V0ZUdyYXBoID0gbmV3IFJvdXRlR3JhcGgobm9kZXMpO1xuICAgIH1cblxuICAgIGNyZWF0ZVBsYXllcigpIHtcbiAgICAgICAgLy8gZ2V0IHNwcml0ZVxuICAgICAgICBjb25zdCB1c2VyQ2hhcmFjdGVyU3ByaXRlOiBIVE1MSW1hZ2VFbGVtZW50ID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHVzZXJDaGFyYWN0ZXJTcHJpdGUuc3JjID0gRmVtYWxlc3R1ZGVudHdhbGtpbmdlYXN0O1xuXG4gICAgICAgIGNvbnN0IHVzZXJDaGFyYWN0ZXI6IER5bmFtaWNPYmplY3QgPSBuZXcgRHluYW1pY09iamVjdCgzMiwgMzIsIHVzZXJDaGFyYWN0ZXJTcHJpdGUsIHRoaXMucm91dGVHcmFwaC5ub2Rlc1swXSk7XG4gICAgICAgIHVzZXJDaGFyYWN0ZXIuc2V0TW92ZW1lbnRTcGVlZCgzMCk7XG4gICAgICAgIHVzZXJDaGFyYWN0ZXIuYWRkQW5pbWF0aW9uTW9kZSgnbW92aW5nJyxcbiAgICAgICAgICAgIG5ldyBBbmltYXRpb25Nb2RlKFxuICAgICAgICAgICAgICAgIEhlbHBlci5QYXRoc1RvSW1ncyhbRmVtYWxlc3R1ZGVudHdhbGtpbmdub3J0aCwgRmVtYWxlc3R1ZGVudHdhbGtpbmdlYXN0LCBGZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoLCBGZW1hbGVzdHVkZW50d2Fsa2luZ3dlc3RdKSxcbiAgICAgICAgICAgICAgICA4LCA1LjVcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgdXNlckNoYXJhY3Rlci5hZGRBbmltYXRpb25Nb2RlKCdpZGxlJyxcbiAgICAgICAgICAgIG5ldyBBbmltYXRpb25Nb2RlKCAvLyBUT0RPOiBwdXQgYWN0dWFsIGlkbGUgYW5pbWF0aW9ucyBoZXJlIGdvZGRhbW5cbiAgICAgICAgICAgICAgICBIZWxwZXIuUGF0aHNUb0ltZ3MoW0ZlbWFsZXN0dWRlbnRpZGxlbm9ydGgsIEZlbWFsZXN0dWRlbnRpZGxlZWFzdCwgRmVtYWxlc3R1ZGVudGlkbGVzb3V0aCwgRmVtYWxlc3R1ZGVudGlkbGV3ZXN0XSksXG4gICAgICAgICAgICAgICAgMSwgNS41XG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIHVzZXJDaGFyYWN0ZXIuYWRkQW5pbWF0aW9uTW9kZSgnc2l0dGluZycsXG4gICAgICAgICAgICBuZXcgQW5pbWF0aW9uTW9kZSggLy8gVE9ETzogbWFrZSBkaXJlY3Rpb25hbCBzaXR0aW5nIGFuaW1hdGlvbnNcbiAgICAgICAgICAgICAgICBIZWxwZXIuUGF0aHNUb0ltZ3MoW0ZlbWFsZXN0dWRlbnRzaXR0aW5nLCBGZW1hbGVzdHVkZW50c2l0dGluZywgRmVtYWxlc3R1ZGVudHNpdHRpbmcsIEZlbWFsZXN0dWRlbnRzaXR0aW5nXSksXG4gICAgICAgICAgICAgICAgMSwgMFxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucGxheWVyT2JqZWN0ID0gdXNlckNoYXJhY3RlcjtcbiAgICAgICAgdGhpcy5keW5hbWljT2JqZWN0cy5wdXNoKHVzZXJDaGFyYWN0ZXIpO1xuICAgIH1cblxuICAgIGRlZkdhbWVMb2dpYygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jcmVhdGVSb3V0ZUdyYXBoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVyKCk7XG4gICAgICAgIC8vIGRlZmluZSBjaGFpciB6b25lc1xuICAgICAgICAvLyBmb3IgZWFjaCBjaGFpcjogW3VwcGVyLWxlZnRdLCB3aWR0aCwgaGVpZ2h0XG4gICAgICAgIGNvbnN0IGNoYWlyWm9uZXM6IEFycmF5PFtWZWN0b3IsIG51bWJlciwgbnVtYmVyXT4gPSBbXG4gICAgICAgICAgICAvLyBiYWNrICgzdGgpIHJvd1xuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAyMzcpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAyMDQpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAxNzQpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAxNDIpLCAzNCwgMzBdLFxuICAgICAgICAgICAgLy8gMmQgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgICAgICAvLyAxc3Qgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgem9uZSBvZiBjaGFpclpvbmVzKVxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZU9iamVjdHMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgSW50ZXJhY3RpdmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMF0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMV0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMl0pKTtcbiAgICAgICAgZm9yIChjb25zdCB6b25lIG9mIGNoYWlyWm9uZXMpXG4gICAgICAgICAgICB0aGlzLmNoYWlyWm9uZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgSW50ZXJhY3RpdmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMF0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMV0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMl0pKTtcbiAgICB9XG5cbiAgICBydW5HYW1lTG9vcCgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBvIG9mIHRoaXMuZHluYW1pY09iamVjdHMpIHtcbiAgICAgICAgICAgIG8ubW92ZU9uUm91dGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yJztcbmltcG9ydCBHbG9iYWxzIGZyb20gJy4vR2xvYmFscyc7XG5pbXBvcnQgQ2xhc3Nyb29tU2NlbmUgZnJvbSAnLi9DbGFzc3Jvb21TY2VuZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgR2xvYmFscy5zZXRBY3RpdmVTY2VuZShcbiAgICAgICAgbmV3IENsYXNzcm9vbVNjZW5lKFxuICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQpKTtcblxuICAgIEdsb2JhbHMuc2V0QWN0aXZlQW5pbWF0b3IoXG4gICAgICAgIG5ldyBBbmltYXRvcihcbiAgICAgICAgICAgIEdsb2JhbHMuZ2V0QWN0aXZlU2NlbmUoKSkpO1xuICAgICAgICAgICAgR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmFuaW1hdGUoKTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgY29uc3QgYWN0aXZlU2NlbmUgPSBHbG9iYWxzLmdldEFjdGl2ZVNjZW5lKCk7XG4gICAgaWYgKGFjdGl2ZVNjZW5lICE9IG51bGwpIHtcbiAgICAgICAgYWN0aXZlU2NlbmUucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9