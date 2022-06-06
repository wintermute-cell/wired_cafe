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
    function DynamicObject(height, width, sprite, routePosition) {
        this.animationModes = {};
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
            return;
        }
        else {
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
                // if the route point has not been reached
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
                this.currAnimationMode.animationStep = 0;
        }
        this.lastTime = src_Globals.getActiveAnimator().currTime;
    };
    DynamicObject.prototype.draw = function (ctx, scene) {
        ctx.drawImage(this.sprite, Math.floor(this.currAnimationMode.animationStep) * this.width, 0, 32, 32, this.position.x * scene.sizeFactor, this.position.y * scene.sizeFactor, this.height * scene.sizeFactor, this.width * scene.sizeFactor);
        this.animate();
    };
    return DynamicObject;
}());
/* harmony default export */ const src_DynamicObject = (DynamicObject);

;// CONCATENATED MODULE: ./src/AnimationMode.ts
var AnimationMode = /** @class */ (function () {
    function AnimationMode(spriteSets, animationSpeed, animationFrames) {
        this.currDirection = 2; // default south facing
        this.animationStep = 0; // current animation frame of the sprite-sheet
        this.spriteSets = spriteSets;
        this.animationSpeed = animationSpeed;
        this.animationFrames = animationFrames;
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
        // TODO: should preferably use the resize methods, but they dont work lol
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
                console.log('in chair');
                if (true) { // TODO: if server says the seat is empty
                    this.playerObject.setMovementRoute(this.routeGraph.getRoute(this.playerObject.routePosition, this.routeGraph.getClosestNodeTo(chair.position)));
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
        below_first_row.addBidNeighbour(fr_first);
        fr_first.addBidNeighbour(fr_sec);
        fr_sec.addBidNeighbour(fr_thrd);
        fr_thrd.addBidNeighbour(fr_frth);
        // second row
        var sc_first = nn(294, 263);
        var sc_sec = nn(294, 231);
        var sc_thrd = nn(294, 199);
        var sc_frth = nn(294, 167);
        below_sec_row.addBidNeighbour(sc_first);
        sc_first.addBidNeighbour(sc_sec);
        sc_sec.addBidNeighbour(sc_thrd);
        sc_thrd.addBidNeighbour(sc_frth);
        // third row
        var th_first = nn(230, 263);
        var th_sec = nn(230, 231);
        var th_thrd = nn(230, 199);
        var th_frth = nn(230, 167);
        below_thrd_row.addBidNeighbour(th_first);
        th_first.addBidNeighbour(th_sec);
        th_sec.addBidNeighbour(th_thrd);
        th_thrd.addBidNeighbour(th_frth);
        // add all the nodes to the scenes graph
        this.routeGraph = new src_RouteGraph(nodes);
    };
    ClassroomScene.prototype.createPlayer = function () {
        // get sprite
        var userCharacterSprite = new Image();
        userCharacterSprite.src = Femalestudentwalkingeast;
        var userCharacter = new src_DynamicObject(32, 32, userCharacterSprite, this.routeGraph.nodes[0]);
        userCharacter.setMovementSpeed(30);
        userCharacter.addAnimationMode('walking', new src_AnimationMode(src_Helper.PathsToImgs([Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast]), 8, 5.5));
        userCharacter.addAnimationMode('idle', new src_AnimationMode(// TODO: put actual idle animations here goddamn
        src_Helper.PathsToImgs([Femalestudentwalkingnorth, Femalestudentwalkingwest, Femalestudentwalkingsouth, Femalestudentwalkingeast]), 8, 5.5));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzQiw2QkFBeUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xELENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7SUFDOUIsSUFBTSxXQUFXLEdBQUcsMEJBQXNCLEVBQUUsQ0FBQztJQUM3QyxJQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7UUFDckIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM3RDtBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL0FuaW1hdG9yLnRzIiwid2VicGFjazovLy8uL3NyYy9WZWN0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0dsb2JhbHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0ludGVyYWN0aXZlT2JqZWN0LnRzIiwid2VicGFjazovLy8uL3NyYy9EeW5hbWljT2JqZWN0LnRzIiwid2VicGFjazovLy8uL3NyYy9BbmltYXRpb25Nb2RlLnRzIiwid2VicGFjazovLy8uL3NyYy9IZWxwZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1JvdXRlR3JhcGgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1dWZWN0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL1JvdXRlTm9kZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvQ2xhc3Nyb29tU2NlbmUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNjZW5lIGZyb20gJy4vU2NlbmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmltYXRvciB7XG4gICAgX3NjZW5lOiBTY2VuZTtcbiAgICBfbGFzdFRpbWU6IG51bWJlcjtcbiAgICBfZGVsdGFUaW1lOiBudW1iZXI7XG4gICAgY3VyclRpbWU6IG51bWJlciA9IDA7XG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IFNjZW5lKSB7XG4gICAgICAgIHRoaXMuX3NjZW5lID0gc2NlbmU7XG4gICAgICAgIHRoaXMuX2xhc3RUaW1lID0gMDtcbiAgICAgICAgdGhpcy5fZGVsdGFUaW1lID0gMDtcbiAgICB9XG5cbiAgICBfZHJhd0ZyYW1lKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9zY2VuZS5kcmF3U3RhdGljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuZHJhd0R5bmFtaWNMYXllcigpO1xuICAgIH1cblxuICAgIGdldERlbHRhVGltZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVsdGFUaW1lO1xuICAgIH1cblxuICAgIGFuaW1hdGUoY3VyclRpbWU6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy5jdXJyVGltZSA9IGN1cnJUaW1lOyAvLyBtYWtlIHRoaXMgYXZhaWxhYmxlIGZvciB0aGUgc2NlbmVcblxuICAgICAgICB0aGlzLl9kZWx0YVRpbWUgPSAoY3VyclRpbWUgLSB0aGlzLl9sYXN0VGltZSkgLyAxMDAwOyAvLyBjb252ZXJ0IG1pbGxpc2Vjb25kcyB0byBzZWNvbmQgZnJhY3Rpb25zXG4gICAgICAgIHRoaXMuX2xhc3RUaW1lID0gY3VyclRpbWU7XG5cbiAgICAgICAgdGhpcy5fc2NlbmUucnVuR2FtZUxvb3AoKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuY2xlYXJTY3JlZW4oKTtcbiAgICAgICAgdGhpcy5fZHJhd0ZyYW1lKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVjdG9yIHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG5cbiAgICBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiogMiArIHRoaXMueSAqKiAyKTtcbiAgICB9XG5cbiAgICBhZGQob3RoZXI6IFZlY3Rvcik6IFZlY3RvciB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yKFxuICAgICAgICAgICAgdGhpcy54ICsgb3RoZXIueCxcbiAgICAgICAgICAgIHRoaXMueSArIG90aGVyLnlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZVRvKG90aGVyOiBWZWN0b3IpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KFxuICAgICAgICAgICAgKHRoaXMueCAtIG90aGVyLngpICoqIDIgK1xuICAgICAgICAgICAgICAgICh0aGlzLnkgLSBvdGhlci55KSAqKiAyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplZCgpOiBWZWN0b3Ige1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aCgpO1xuICAgICAgICBpZihsZW4gIT09IDApXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLyBsZW4sIHRoaXMueSAvIGxlbik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKDAsIDApO1xuICAgIH1cbn1cbiIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuaW1wb3J0IEFuaW1hdG9yIGZyb20gJy4vQW5pbWF0b3InO1xuaW1wb3J0IFNjZW5lIGZyb20gJy4vU2NlbmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxzIHtcbiAgICAvLyBjb25maWcgZmllbGRzXG4gICAgc3RhdGljIERFQlVHOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIC8vIG1vdXNlIHBvc2l0aW9uXG4gICAgc3RhdGljIF9jdXJyZW50TW91c2VQb3NpdGlvbjogVmVjdG9yID0gbmV3IFZlY3RvcigwLCAwKTtcbiAgICBzdGF0aWMgZ2V0Q3VycmVudE1vdXNlUG9zKCk6IFZlY3RvciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbjtcbiAgICB9XG4gICAgc3RhdGljIHNldEN1cnJlbnRNb3VzZVBvcyhwb3M6IFZlY3Rvcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbiA9IHBvcztcbiAgICB9XG5cbiAgICAvLyBhbmltYXRvclxuICAgIHN0YXRpYyBfYWN0aXZlQW5pbWF0b3I6IEFuaW1hdG9yO1xuICAgIHN0YXRpYyBnZXRBY3RpdmVBbmltYXRvcigpOiBBbmltYXRvciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVBbmltYXRvcjtcbiAgICB9XG4gICAgc3RhdGljIHNldEFjdGl2ZUFuaW1hdG9yKGFuaW06IEFuaW1hdG9yKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2FjdGl2ZUFuaW1hdG9yID0gYW5pbTtcbiAgICB9XG5cbiAgICAvLyBzY2VuZVxuICAgIHN0YXRpYyBfYWN0aXZlU2NlbmU6IFNjZW5lO1xuICAgIHN0YXRpYyBnZXRBY3RpdmVTY2VuZSgpOiBTY2VuZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVTY2VuZTtcbiAgICB9XG4gICAgc3RhdGljIHNldEFjdGl2ZVNjZW5lKHNjZW5lOiBTY2VuZSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9hY3RpdmVTY2VuZSA9IHNjZW5lO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IFZlY3RvciBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyYWN0aXZlT2JqZWN0IHtcbiAgcG9zaXRpb246IFZlY3RvcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnRpbmdQb3M6IFZlY3Rvciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLnBvc2l0aW9uID0gc3RhcnRpbmdQb3M7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICB9XG59XG4iLCJpbXBvcnQgR2xvYmFscyBmcm9tICcuL0dsb2JhbHMnO1xuaW1wb3J0IFZlY3RvciBmcm9tICcuL1ZlY3Rvcic7XG5pbXBvcnQgV1ZlY3RvciBmcm9tICcuL1dWZWN0b3InO1xuaW1wb3J0IFNjZW5lIGZyb20gJy4vU2NlbmUnO1xuaW1wb3J0IEFuaW1hdGlvbk1vZGUgZnJvbSAnLi9BbmltYXRpb25Nb2RlJztcbmltcG9ydCBSb3V0ZU5vZGUgZnJvbSAnLi9Sb3V0ZU5vZGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEeW5hbWljT2JqZWN0IHtcblxuICBoZWlnaHQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcblxuICBzcHJpdGU6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgY3VyckFuaW1hdGlvbk1vZGUhOiBBbmltYXRpb25Nb2RlO1xuICBhbmltYXRpb25Nb2RlczogeyBba2V5OiBzdHJpbmddOiBBbmltYXRpb25Nb2RlIH0gPSB7fTtcblxuICBzcHJpdGVTaXR0aW5nITogSFRNTEltYWdlRWxlbWVudDtcblxuICBwb3NpdGlvbiE6IFdWZWN0b3I7IC8vIGN1cnJlbnQgeCwgeSBwb3NpdGlvblxuICByb3V0ZVBvc2l0aW9uOiBSb3V0ZU5vZGU7XG5cbiAgbW92ZW1lbnRSb3V0ZTogUm91dGVOb2RlW10gPSBbXTsgLy8gYSBsaXN0IG9mIHgsIHkgcG9zaXRpb24gb2JqZWN0c1xuICBzdGVwT2ZSb3V0ZTogbnVtYmVyID0gMDsgLy8gYW4gaW5kZXggb2YgdGhlIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIGFib3ZlIHJvdXRlXG4gIG1vdmVtZW50U3BlZWQ6IG51bWJlcjtcbiAgZGlzdFRvTmV4dFBvaW50OiBudW1iZXIgPSAwO1xuXG4gIC8vIHRoaXMgaXMgdXNlZCB0byBjaGVjayB3aGVuIHRoZSBhbmltYXRlIG1ldGhvZCB3YXMgbGFzdCBjYWxsZWRcbiAgLy8gdG8gcHJldmVudCBkb3VibGUgYW5pbWF0aW9uIGNhbGxzIGluIG9uZSBmcmFtZVxuICBsYXN0VGltZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihoZWlnaHQ6IG51bWJlcixcbiAgICAgICAgICAgICAgd2lkdGg6IG51bWJlcixcbiAgICAgICAgICAgICAgc3ByaXRlOiBIVE1MSW1hZ2VFbGVtZW50LFxuICAgICAgICAgICAgICByb3V0ZVBvc2l0aW9uOiBSb3V0ZU5vZGUpIHtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5zcHJpdGUgPSBzcHJpdGU7XG4gICAgdGhpcy5yb3V0ZVBvc2l0aW9uID0gcm91dGVQb3NpdGlvbjtcbiAgICB0aGlzLnNldFBvcyhyb3V0ZVBvc2l0aW9uLnBvc2l0aW9uLngsIHJvdXRlUG9zaXRpb24ucG9zaXRpb24ueSlcbiAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSAwO1xuICB9XG5cbiAgYWRkQW5pbWF0aW9uTW9kZShuYW1lOiBzdHJpbmcsIG1vZGU6IEFuaW1hdGlvbk1vZGUpIHtcbiAgICBpZiAoIXRoaXMuY3VyckFuaW1hdGlvbk1vZGUpIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUgPSBtb2RlOyAvLyB0aGUgZmlyc3QgYXNzaWduZWQgYW5pbWF0aW9uIG1vZGUgYmVjb21lcyB0aGUgaW5pdGlhbCBtb2RlXG4gICAgdGhpcy5hbmltYXRpb25Nb2Rlc1tuYW1lXSA9IG1vZGU7XG4gIH1cblxuICBzZXRNb3ZlbWVudFJvdXRlKHJvdXRlOiBSb3V0ZU5vZGVbXSkge1xuICAgIGlmIChyb3V0ZS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLm1vdmVtZW50Um91dGUgPSByb3V0ZTtcbiAgICAgIHRoaXMuc3RlcE9mUm91dGUgPSAwO1xuICAgICAgdGhpcy5kaXN0VG9OZXh0UG9pbnQgPSB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlVG8ocm91dGVbMV0ucG9zaXRpb24pO1xuICAgICAgdGhpcy5yb3V0ZVBvc2l0aW9uID0gcm91dGVbMV07XG4gICAgfVxuICB9XG5cbiAgc2V0TW92ZW1lbnRTcGVlZChzcGVlZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gc3BlZWQ7XG4gIH1cblxuICBzZXRQb3MoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBhZGp1c3RlZFBvczogVmVjdG9yID0gbmV3IFZlY3Rvcih4LCB5KTtcbiAgICBhZGp1c3RlZFBvcy54IC09IHRoaXMud2lkdGggLyAyO1xuICAgIGFkanVzdGVkUG9zLnkgLT0gdGhpcy5oZWlnaHQ7XG4gICAgdGhpcy5wb3NpdGlvbiA9IGFkanVzdGVkUG9zO1xuICB9XG5cbiAgZ2V0UG9zKCk6IFZlY3RvciB7XG4gICAgY29uc3QgcCA9IG5ldyBWZWN0b3IodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICAgIHAueCArPSB0aGlzLndpZHRoIC8gMjtcbiAgICBwLnkgKz0gdGhpcy5oZWlnaHQ7XG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIHNlbGVjdFNwcml0ZShkaXJlY3Rpb246IFZlY3Rvcik6IHZvaWQge1xuICAgIC8vaWYgKGRpcmVjdGlvbi54ID09PSAwICYmIGRpcmVjdGlvbi55ID09PSAwKSB7XG4gICAgLy8gIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzSWRsZVsyXTtcbiAgICAvL30gZWxzZSBpZiAoTWF0aC5hYnMoZGlyZWN0aW9uLngpID4gTWF0aC5hYnMoZGlyZWN0aW9uLnkpKSB7XG4gICAgLy8gIC8vIGhvcml6b250YWwgbW92ZW1lbnQgaXMgc3Ryb25nZXJcbiAgICAvLyAgaWYgKGRpcmVjdGlvbi54ID4gMCkgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNXYWxrWzNdO1xuICAgIC8vICBlbHNlIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzV2Fsa1sxXTtcbiAgICAvL30gZWxzZSB7XG4gICAgLy8gIC8vIHZlcnRpY2FsIG1vdmVtZW50IGlzIHN0cm9uZ2VyXG4gICAgLy8gIGlmIChkaXJlY3Rpb24ueSA+IDApIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzV2Fsa1syXTtcbiAgICAvLyAgZWxzZSB0aGlzLnNwcml0ZSA9IHRoaXMuc3ByaXRlc1dhbGtbMF07XG4gICAgLy99XG4gIH1cblxuICBtb3ZlT25Sb3V0ZSgpOiB2b2lkIHtcbiAgICAvLyBpZiB0aGUgZW5kIG9mIHRoZSByb3V0ZSBoYXMgYmVlbiByZWFjaGVkLCBubyBtb3ZlbWVudCBpcyByZXF1aXJlZC4gaW5zdGVhZCwgY2xlYXIgdGhlIGN1cnJlbnQgcm91dGVcbiAgICBpZiAodGhpcy5zdGVwT2ZSb3V0ZSA+PSB0aGlzLm1vdmVtZW50Um91dGUubGVuZ3RoLTEpIHtcbiAgICAgIHRoaXMuc3RlcE9mUm91dGUgPSAwO1xuICAgICAgdGhpcy5tb3ZlbWVudFJvdXRlID0gW11cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGVsdGFUaW1lOiBudW1iZXIgPSBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuZ2V0RGVsdGFUaW1lKCk7IC8vIHdpbGwgYmUgdXNlZCBhIGNvdXBsZSBvZiB0aW1lcywgc28gc2hvcnQgbmFtZSBpcyBiZXR0ZXJcbiAgICAgIGNvbnN0IHRhcmdldDogV1ZlY3RvciA9IHRoaXMubW92ZW1lbnRSb3V0ZVt0aGlzLnN0ZXBPZlJvdXRlICsgMV0ucG9zaXRpb247ICAvLyB0aGUgY3VycmVudCBuZXh0IG5vZGUgaW4gdGhlIHJvdXRlXG5cbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBuZXh0IHN0ZXAgd291bGQgcmVhY2ggdGhlIHRhcmdldFxuICAgICAgY29uc3QgbG9va0FoZWFkRGlzdGFuY2UgPSB0aGlzLmRpc3RUb05leHRQb2ludCAtICh0aGlzLm1vdmVtZW50U3BlZWQgKiBkZWx0YVRpbWUpO1xuICAgICAgaWYgKGxvb2tBaGVhZERpc3RhbmNlIDw9IDApIHtcbiAgICAgICAgdGhpcy5zZXRQb3ModGFyZ2V0LngsIHRhcmdldC55KTtcbiAgICAgICAgdGhpcy5zdGVwT2ZSb3V0ZSsrO1xuXG4gICAgICAgIC8vIHByZXBhcmUgZm9yIHRoZSBuZXh0IHBhcnQgb2YgdGhlIHJvdXRlXG4gICAgICAgIGlmICh0aGlzLnN0ZXBPZlJvdXRlIDwgdGhpcy5tb3ZlbWVudFJvdXRlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnJvdXRlUG9zaXRpb24gPSB0aGlzLm1vdmVtZW50Um91dGVbdGhpcy5zdGVwT2ZSb3V0ZSsxXTsgLy8gdGhlIHJvdXRlIHBvc2l0aW9uIGlzIGFsd2F5cyB0aGUgdGFyZ2V0IG9mIHRoZSB3YWxrXG4gICAgICAgICAgdGhpcy5kaXN0VG9OZXh0UG9pbnQgPSB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlVG8odGhpcy5yb3V0ZVBvc2l0aW9uLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNpbmNlIHRoaXMgc3RlcCB3aWxsIG5vdCByZWFjaCB0aGUgdGFyZ2V0LCBqdXN0IG1vdmUgYXMgZXhwZWN0ZWRcbiAgICAgICAgY29uc3QgY3VyclBvczogV1ZlY3RvciA9IHRoaXMuZ2V0UG9zKCk7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IG5ldyBWZWN0b3IoXG4gICAgICAgICAgdGFyZ2V0LnggLSBjdXJyUG9zLngsXG4gICAgICAgICAgdGFyZ2V0LnkgLSBjdXJyUG9zLnksXG4gICAgICAgICk7XG5cbiAgICAgIC8vIG5vcm1hbGl6aW5nIHRoZSBkaXJlY3Rpb24gdmVjdG9yXG4gICAgICBjb25zdCBuRGlyZWN0aW9uOiBWZWN0b3IgPSBkaXJlY3Rpb24ubm9ybWFsaXplZCgpO1xuICAgICAgICAvLyBpZiB0aGUgcm91dGUgcG9pbnQgaGFzIG5vdCBiZWVuIHJlYWNoZWRcbiAgICAgICAgY29uc3QgcDogV1ZlY3RvciA9IHRoaXMuZ2V0UG9zKCk7XG4gICAgICAgIHRoaXMuc2V0UG9zKFxuICAgICAgICAgIHAueCArIG5EaXJlY3Rpb24ueCAqIGRlbHRhVGltZSAqIHRoaXMubW92ZW1lbnRTcGVlZCxcbiAgICAgICAgICBwLnkgKyBuRGlyZWN0aW9uLnkgKiBkZWx0YVRpbWUgKiB0aGlzLm1vdmVtZW50U3BlZWQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZGlzdFRvTmV4dFBvaW50ID0gcC5kaXN0YW5jZVRvKHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5hbmltYXRpb25Nb2RlcykubGVuZ3RoIDw9IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiVHJpZWQgdG8gYW5pbWF0ZSBkeW5hbWljIG9iamVjdCB3aXRob3V0IGFueSBhc3NpZ25lZCBhbmltYXRpb25Nb2RlcyFcIilcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBwcmV2ZW50IGFuaW1hdGlvbiBmcm9tIHByb2dyZXNzaW5nIG11bHRpcGxlIHRpbWVzIGVhY2ggZnJhbWVcbiAgICAvLyBpZiB0aGUgb2JqIGlzIHJlbmRlcmVkIG11bHRpcGxlIHRpbWVzIGJ5IGNvbXBhcmluZyB0aGUgbGFzdCB0aW1lc3RhbXAgd2l0aCB0aGUgY3VycmVudCBvbmVcbiAgICBpZiAodGhpcy5sYXN0VGltZSAhPT0gR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmN1cnJUaW1lKSB7XG4gICAgICB0aGlzLmN1cnJBbmltYXRpb25Nb2RlLmFuaW1hdGlvblN0ZXAgKz1cbiAgICAgICAgICBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuZ2V0RGVsdGFUaW1lKCkgKiB0aGlzLmN1cnJBbmltYXRpb25Nb2RlLmFuaW1hdGlvblNwZWVkO1xuICAgICAgaWYgKHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCA+IHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uRnJhbWVzKSB0aGlzLmN1cnJBbmltYXRpb25Nb2RlLmFuaW1hdGlvblN0ZXAgPSAwO1xuICAgIH1cbiAgICB0aGlzLmxhc3RUaW1lID0gR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmN1cnJUaW1lO1xuICB9XG5cbiAgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgc2NlbmU6IFNjZW5lKTogdm9pZCB7XG4gICAgY3R4LmRyYXdJbWFnZShcbiAgICAgIHRoaXMuc3ByaXRlLFxuICAgICAgTWF0aC5mbG9vcih0aGlzLmN1cnJBbmltYXRpb25Nb2RlLmFuaW1hdGlvblN0ZXApICogdGhpcy53aWR0aCwgMCxcbiAgICAgIDMyLCAzMixcbiAgICAgIHRoaXMucG9zaXRpb24ueCAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgICB0aGlzLnBvc2l0aW9uLnkgKiBzY2VuZS5zaXplRmFjdG9yLFxuICAgICAgdGhpcy5oZWlnaHQgKiBzY2VuZS5zaXplRmFjdG9yLFxuICAgICAgdGhpcy53aWR0aCAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgKTtcbiAgICB0aGlzLmFuaW1hdGUoKTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5pbWF0aW9uTW9kZSB7XG4gICAgLy8gTiwgVywgUywgRVxuICAgIHNwcml0ZVNldHM6IEhUTUxJbWFnZUVsZW1lbnRbXTtcblxuICAgIGN1cnJEaXJlY3Rpb246IG51bWJlciA9IDI7IC8vIGRlZmF1bHQgc291dGggZmFjaW5nXG5cbiAgICBhbmltYXRpb25TdGVwOiBudW1iZXIgPSAwOyAvLyBjdXJyZW50IGFuaW1hdGlvbiBmcmFtZSBvZiB0aGUgc3ByaXRlLXNoZWV0XG4gICAgYW5pbWF0aW9uRnJhbWVzOiBudW1iZXI7IC8vIHRvdGFsIGFtb3VudCBvZiBhbmltYXRpb24gZnJhbWVzIGluIHNwcml0ZS1zaGVldFxuICAgIGFuaW1hdGlvblNwZWVkOiBudW1iZXI7IC8vIGFuaW1hdGlvbiBmcmFtZXMgcGVyIHNlY29uZFxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHNwcml0ZVNldHM6IEhUTUxJbWFnZUVsZW1lbnRbXSxcbiAgICAgICAgYW5pbWF0aW9uU3BlZWQ6IG51bWJlciwgYW5pbWF0aW9uRnJhbWVzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zcHJpdGVTZXRzID0gc3ByaXRlU2V0cztcbiAgICAgICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IGFuaW1hdGlvblNwZWVkO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lcyA9IGFuaW1hdGlvbkZyYW1lcztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBIZWxwZXIge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG5cbiAgICBzdGF0aWMgUGF0aFRvSW1nKHBhdGg6IHN0cmluZyk6IEhUTUxJbWFnZUVsZW1lbnQge1xuICAgICAgICBsZXQgaW1nOiBIVE1MSW1hZ2VFbGVtZW50ID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgICAgICByZXR1cm4gaW1nXG4gICAgfVxuXG4gICAgc3RhdGljIFBhdGhzVG9JbWdzKHBhdGhzOiBzdHJpbmdbXSk6IEhUTUxJbWFnZUVsZW1lbnRbXSB7XG4gICAgICAgIGxldCBpbWdzOiBIVE1MSW1hZ2VFbGVtZW50W10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgICAgICAgICBjb25zdCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgICAgICAgICAgaW1ncy5wdXNoKGltZylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW1nc1xuICAgIH1cbn1cbiIsImltcG9ydCBSb3V0ZU5vZGUgZnJvbSAnLi9Sb3V0ZU5vZGUnO1xuaW1wb3J0IFZlY3RvciBmcm9tICcuL1ZlY3Rvcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdXRlR3JhcGgge1xuICAgIG5vZGVzOiBSb3V0ZU5vZGVbXTtcblxuICAgIGNvbnN0cnVjdG9yKG5vZGVzOiBSb3V0ZU5vZGVbXSkge1xuICAgICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XG4gICAgfVxuXG4gICAgLy8gZ2V0IHRoZSBjbG9zZXN0IG5vZGUgaW4gdGhlIGdyYXBoIHRvIGEgZ2l2ZW4gYXJiaXRyYXJ5IHBvc2l0aW9uIG9uIHRoZSBzY3JlZW5cbiAgICBnZXRDbG9zZXN0Tm9kZVRvKHBvc2l0aW9uOiBWZWN0b3IpOiBSb3V0ZU5vZGUge1xuICAgICAgICBsZXQgY2xvc2VzdDogUm91dGVOb2RlID0gdGhpcy5ub2Rlc1swXTtcbiAgICAgICAgbGV0IG1pbkRpc3Q6IG51bWJlciA9IHRoaXMubm9kZXNbMF0ucG9zaXRpb24uZGlzdGFuY2VUbyhwb3NpdGlvbik7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBsZXQgZDogbnVtYmVyID0gbm9kZS5wb3NpdGlvbi5kaXN0YW5jZVRvKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIGlmIChkIDwgbWluRGlzdCkge1xuICAgICAgICAgICAgICAgIG1pbkRpc3QgPSBkO1xuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbG9zZXN0O1xuICAgIH1cblxuXG4gICAgLy8gc2hpdHR5IHJhbmRvbWl6ZWQgcm91dGluZyBhbGdvLiBkb2VzbnQgZmluZCBzaG9ydGVzdCByb3V0ZSwgYnV0IHByb3ZpZGVzIHZhcmlldHlcbiAgICBnZXRSb3V0ZShmcm9tOiBSb3V0ZU5vZGUsIHRvOiBSb3V0ZU5vZGUpOiBSb3V0ZU5vZGVbXSB7XG4gICAgICAgIGlmIChmcm9tID09PSB0bykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1cnJlbnROb2RlOiBSb3V0ZU5vZGUgPSBmcm9tO1xuICAgICAgICBsZXQgY3VyclJvdXRlOiBSb3V0ZU5vZGVbXSA9IFtmcm9tXTtcbiAgICAgICAgbGV0IHZpc2l0ZWROb2RlczogUm91dGVOb2RlW10gPSBbZnJvbV07XG4gICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gdG8pIHsgLy8gaWYgdGFyZ2V0IGlzIHJlYWNoZWQsIGVuZCB0aGUgc2VhcmNoXG4gICAgICAgICAgICBsZXQgY29sbGFwc2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjdXJyZW50Tm9kZS5uZWlnaGJvdXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG46IFJvdXRlTm9kZSA9IGN1cnJlbnROb2RlLm5laWdoYm91cnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKCF2aXNpdGVkTm9kZXMuaW5jbHVkZXMobikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VyclJvdXRlW2N1cnJSb3V0ZS5sZW5ndGgtMl07XG4gICAgICAgICAgICAgICAgICAgIGN1cnJSb3V0ZS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY29sbGFwc2UpIHtcbiAgICAgICAgICAgICAgICBjdXJyUm91dGUucHVzaChjdXJyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgdmlzaXRlZE5vZGVzLnB1c2goY3VycmVudE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGN1cnJSb3V0ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcblxuLy8gd29ybGQgc3BhY2UgdmVjdG9yXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXVmVjdG9yIGV4dGVuZHMgVmVjdG9yIHsgfVxuIiwiaW1wb3J0IFdWZWN0b3IgZnJvbSAnLi9XVmVjdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm91dGVOb2RlIHtcbiAgICBwb3NpdGlvbjogV1ZlY3RvcjtcbiAgICBuZWlnaGJvdXJzOiBSb3V0ZU5vZGVbXTtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgV1ZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy5uZWlnaGJvdXJzID0gW107XG4gICAgfVxuXG4gICAgYWRkTmVpZ2hib3VyKG46IFJvdXRlTm9kZSkge1xuICAgICAgICB0aGlzLm5laWdoYm91cnMucHVzaChuKTtcbiAgICB9XG5cbiAgICAvLyBhZGROZWlnaGJvdXIgaW4gYm90aCBkaXJlY3Rpb25zXG4gICAgYWRkQmlkTmVpZ2hib3VyKG46IFJvdXRlTm9kZSkge1xuICAgICAgICB0aGlzLm5laWdoYm91cnMucHVzaChuKTtcbiAgICAgICAgbi5uZWlnaGJvdXJzLnB1c2godGhpcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IFNjZW5lIGZyb20gJy4vU2NlbmUnO1xuaW1wb3J0IFZlY3RvciBmcm9tICcuL1ZlY3Rvcic7XG5pbXBvcnQgSW50ZXJhY3RpdmVPYmplY3QgZnJvbSAnLi9JbnRlcmFjdGl2ZU9iamVjdCc7XG5pbXBvcnQgR2xvYmFscyBmcm9tICcuL0dsb2JhbHMnO1xuaW1wb3J0IER5bmFtaWNPYmplY3QgZnJvbSAnLi9EeW5hbWljT2JqZWN0JztcbmltcG9ydCBBbmltYXRpb25Nb2RlIGZyb20gJy4vQW5pbWF0aW9uTW9kZSc7XG5pbXBvcnQgSGVscGVyIGZyb20gJy4vSGVscGVyJztcbmltcG9ydCBSb3V0ZUdyYXBoIGZyb20gJy4vUm91dGVHcmFwaCc7XG5pbXBvcnQgUm91dGVOb2RlIGZyb20gJy4vUm91dGVOb2RlJztcblxuLy8gcmVzb3VyY2UgcGF0aHNcbi8vIGNsYXNzcm9vbVxuY29uc3QgQ2xhc3Nyb29tUmVuZGVyOiBzdHJpbmcgPVxuICAgICcvcmVzb3VyY2VzL3NjZW5lcy9jbGFzc3Jvb20vQ2xhc3Nyb29tUmVuZGVyLnBuZyc7XG5jb25zdCBDbGFzc3Jvb21MaWdodDogc3RyaW5nID1cbiAgICAnL3Jlc291cmNlcy9zY2VuZXMvY2xhc3Nyb29tL0NsYXNzcm9vbUxpZ2h0LnBuZyc7XG5cbi8vIGZlbWFsZSBzdHVkZW50XG5jb25zdCBGZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3Q6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3Qtc2hlZXQucG5nJztcbmNvbnN0IEZlbWFsZXN0dWRlbnR3YWxraW5nbm9ydGg6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ25vcnRoLXNoZWV0LnBuZyc7XG5jb25zdCBGZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoOiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudHdhbGtpbmdzb3V0aC1zaGVldC5wbmcnO1xuY29uc3QgRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0OiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0LXNoZWV0LnBuZyc7XG5cbmNvbnN0IEZlbWFsZXN0dWRlbnRzaXR0aW5nOiBzdHJpbmcgPSAnLi4vcmVzb3VyY2VzL2NoYXJhY3RlcnMvZmVtYWxlX3N0dWRlbnQvRmVtYWxlc3R1ZGVudHNpdHRpbmcucG5nJ1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsYXNzcm9vbVNjZW5lIGltcGxlbWVudHMgU2NlbmUge1xuICAgIC8vIHRoZSBzY2VuZXMgY2FudmFzIGxvY2F0aW9uXG4gICAgbGVmdDogbnVtYmVyO1xuICAgIHRvcDogbnVtYmVyO1xuXG4gICAgLy8gdGhlIHNpemUgb2YgdGhlIGFjdHVhbCBhdmFpbGFibGUgc2NyZWVuXG4gICAgc2NyZWVuV2lkdGg6IG51bWJlcjtcbiAgICBzY3JlZW5IZWlnaHQ6IG51bWJlcjtcblxuICAgIC8vIHRoZSBjYW52YXMgY3R4XG4gICAgc3RhdGljQ3R4ITogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIGR5bmFtaWNDdHghOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cbiAgICBzdGF0aWNDYW52YXMhOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBkeW5hbWljQ2FudmFzITogSFRNTENhbnZhc0VsZW1lbnQ7XG5cbiAgICAvLyB0aGUgcGl4ZWwgc2l6ZSBvZiB0aGUgb3JpZ2luYWwgc2NlbmUgYXJ0XG4gICAgcmVhZG9ubHkgb3JpZ2luYWxXaWR0aDogbnVtYmVyID0gNjg0O1xuICAgIHJlYWRvbmx5IG9yaWdpbmFsSGVpZ2h0OiBudW1iZXIgPSA0NTQ7XG5cbiAgICAvLyB0aGUgc2l6ZSBvZiB0aGUgc2NlbmUgYXJ0IGFmdGVyIHNjYWxpbmcgaGFzIGJlZW4gYXBwbGllZFxuICAgIHJlYWxXaWR0aDogbnVtYmVyO1xuICAgIHJlYWxIZWlnaHQ6IG51bWJlcjtcblxuICAgIC8vIHRoZSBmYWN0b3IgYnkgd2hpY2ggdGhlIG9yaWdpbmFsIGFydCBoYXMgdG8gYmUgc2NhbGVkIHRvXG4gICAgLy8gZmlsbCB0aGUgYXZhaWxhYmxlIHNjcmVlbiBzaXplLlxuICAgIHNpemVGYWN0b3I6IG51bWJlcjtcblxuICAgIC8vIGFuIGFkZGl0aW9uYWwgc2NhbGluZyBmYWN0b3IsIHRoYXQgY2FuIGJlIHVzZWQgdG9cbiAgICAvLyBhcHBseSBhZGRpdGlvbmFsIHNjYWxpbmdcbiAgICB6b29tRmFjdG9yOiBudW1iZXIgPSAxLjE7XG5cbiAgICBwbGF5ZXJPYmplY3QhOiBEeW5hbWljT2JqZWN0O1xuICAgIGR5bmFtaWNPYmplY3RzOiBEeW5hbWljT2JqZWN0W10gPSBbXTtcblxuICAgIC8vIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIEludGVyYWN0aXZlT2JqZWN0cyBpbiB0aGUgc2NlbmVcbiAgICBpbnRlcmFjdGl2ZU9iamVjdHM6IEludGVyYWN0aXZlT2JqZWN0W10gPSBbXTtcblxuICAgIGNoYWlyWm9uZXM6IEludGVyYWN0aXZlT2JqZWN0W10gPSBbXTtcblxuICAgIHJvdXRlR3JhcGghOiBSb3V0ZUdyYXBoO1xuXG4gICAgY29uc3RydWN0b3Ioc2NyZWVuV2lkdGg6IG51bWJlciwgc2NyZWVuSGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5sZWZ0ID0gMDtcbiAgICAgICAgdGhpcy50b3AgPSAwO1xuICAgICAgICB0aGlzLnNjcmVlbldpZHRoID0gc2NyZWVuV2lkdGg7XG4gICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gc2NyZWVuSGVpZ2h0O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmYWN0b3IgYnkgd2hpY2ggb3JpZ2luYWwgaW1hZ2UgaGVpZ2h0XG4gICAgICAgIC8vIGlzIHNtYWxsZXIgdGhhbiBzY3JlZW4uXG4gICAgICAgIHRoaXMuc2l6ZUZhY3RvciA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gdGhpcy5vcmlnaW5hbEhlaWdodDtcblxuICAgICAgICAvLyBhZGp1c3Qgc2l6ZSB0byB3aWR0aCBpZiBhZGp1c3RpbmcgYnkgaGVpZ2h0IGRvZXNuJ3QgZmlsbCBzY3JlZW4uXG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsV2lkdGggKiB0aGlzLnNpemVGYWN0b3IgPCB0aGlzLnNjcmVlbldpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLnNpemVGYWN0b3IgPSB0aGlzLnNjcmVlbldpZHRoIC8gdGhpcy5vcmlnaW5hbFdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaXplRmFjdG9yICo9IHRoaXMuem9vbUZhY3RvcjsgLy8gYXBwbHkgem9vbVxuXG4gICAgICAgIC8vIHNjcm9sbCB0aGUgY2FtZXJhIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjZW5lXG4gICAgICAgIGNvbnN0IHNjX3k6IG51bWJlciA9ICh0aGlzLm9yaWdpbmFsSGVpZ2h0ICpcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemVGYWN0b3IgLVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0KSAvIDI7XG4gICAgICAgIGNvbnN0IHNjX3g6IG51bWJlciA9ICh0aGlzLm9yaWdpbmFsV2lkdGggKlxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZUZhY3RvciAtXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCkgLyAyO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbyhzY194LCBzY195KTtcbiAgICAgICAgfSwgMik7XG5cbiAgICAgICAgLy8gYXBwbHkgc2l6aW5nXG4gICAgICAgIHRoaXMucmVhbFdpZHRoID0gdGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yO1xuICAgICAgICB0aGlzLnJlYWxIZWlnaHQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0ICogdGhpcy5zaXplRmFjdG9yO1xuXG4gICAgICAgIHRoaXMuZGVmU3RhdGljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5kZWZEeW5hbWljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5kZWZHYW1lTG9naWMoKTtcbiAgICB9XG5cbiAgICByZXNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAvLyBjYWxjdWxhdGUgZmFjdG9yIGJ5IHdoaWNoIG9yaWdpbmFsIGltYWdlIGhlaWdodCBpcyBzbWFsbGVyIHRoYW4gc2NyZWVuLlxuICAgICAgICB0aGlzLnNpemVGYWN0b3IgPSB0aGlzLnNjcmVlbkhlaWdodCAvIHRoaXMub3JpZ2luYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gYWRqdXN0IHNpemUgdG8gd2lkdGggaWYgYWRqdXN0aW5nIGJ5IGhlaWdodCBkb2Vzbid0IGZpbGwgc2NyZWVuLlxuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yIDwgdGhpcy5zY3JlZW5XaWR0aCkge1xuICAgICAgICAgICAgdGhpcy5zaXplRmFjdG9yID0gdGhpcy5zY3JlZW5XaWR0aCAvIHRoaXMub3JpZ2luYWxXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2l6ZUZhY3RvciAqPSB0aGlzLnpvb21GYWN0b3I7IC8vIGFwcGx5IHpvb21cblxuICAgICAgICAvLyBzY3JvbGwgdGhlIGNhbWVyYSB0byB0aGUgY2VudGVyIG9mIHRoZSBzY2VuZVxuICAgICAgICBjb25zdCBzY195ID0gKHRoaXMub3JpZ2luYWxIZWlnaHQgKiB0aGlzLnNpemVGYWN0b3IgLSB0aGlzLnNjcmVlbkhlaWdodCkgLyAyO1xuICAgICAgICBjb25zdCBzY194ID0gKHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvciAtIHRoaXMuc2NyZWVuV2lkdGgpIC8gMjtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oc2NfeCwgc2NfeSk7XG4gICAgICAgIH0sIDIpO1xuXG4gICAgICAgIC8vIGFwcGx5IHNpemluZ1xuICAgICAgICB0aGlzLnJlYWxXaWR0aCA9IHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvcjtcbiAgICAgICAgdGhpcy5yZWFsSGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEhlaWdodCAqIHRoaXMuc2l6ZUZhY3RvcjtcblxuICAgICAgICAvLyBUT0RPOiBzaG91bGQgcHJlZmVyYWJseSB1c2UgdGhlIHJlc2l6ZSBtZXRob2RzLCBidXQgdGhleSBkb250IHdvcmsgbG9sXG4gICAgICAgIHRoaXMucmVzaXplU3RhdGljTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5yZXNpemVEeW5hbWljTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCBtb3VzZVBvczogVmVjdG9yID0gdGhpcy5nZXRSZWxNb3VzZVBvcyhldmVudCk7XG4gICAgICAgIGlmIChHbG9iYWxzLkRFQlVHKSBjb25zb2xlLmxvZyhtb3VzZVBvcyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGFpclpvbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaGFpciA9IHRoaXMuY2hhaXJab25lc1tpXTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzV2l0aGluSW50ZXJhY3RpdmVPYmplY3QobW91c2VQb3MsIGNoYWlyKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbiBjaGFpcicpO1xuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7IC8vIFRPRE86IGlmIHNlcnZlciBzYXlzIHRoZSBzZWF0IGlzIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyT2JqZWN0LnNldE1vdmVtZW50Um91dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlR3JhcGguZ2V0Um91dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJPYmplY3Qucm91dGVQb3NpdGlvbiwgdGhpcy5yb3V0ZUdyYXBoLmdldENsb3Nlc3ROb2RlVG8oY2hhaXIucG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWsgLy8gbm8gbmVlZCB0byBsb29rIGF0IHRoZSBvdGhlciBjaGFpcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUhvdmVyKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIEdsb2JhbHMuc2V0Q3VycmVudE1vdXNlUG9zKHRoaXMuZ2V0UmVsTW91c2VQb3MoZXZlbnQpKTtcbiAgICB9XG5cbiAgICBnZXRNb3VzZVBvcyhldmVudDogTW91c2VFdmVudCk6IFZlY3RvciB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yKGV2ZW50Lm9mZnNldFgsIGV2ZW50Lm9mZnNldFkpO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgdHJ1ZSBpZiB0aGUgKHJlbGF0aXZlKSBjb29yZGluYXRlcyBhcmUgd2l0aGluIHRoZSBnaXZlbiB6b25lLlxuICAgIGlzV2l0aGluSW50ZXJhY3RpdmVPYmplY3QocG9zOiBWZWN0b3IsIGlPYmo6IEludGVyYWN0aXZlT2JqZWN0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChwb3MueCA+IGlPYmoucG9zaXRpb24ueCAmJiBwb3MueCA8IGlPYmoucG9zaXRpb24ueCArIGlPYmoud2lkdGgpIHtcbiAgICAgICAgICAgIGlmIChwb3MueSA+IGlPYmoucG9zaXRpb24ueSAmJiBwb3MueSA8IGlPYmoucG9zaXRpb24ueSArIGlPYmouaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFJlbE1vdXNlUG9zKGV2ZW50OiBNb3VzZUV2ZW50KTogVmVjdG9yIHtcbiAgICAgICAgY29uc3QgcG9zID0gbmV3IFZlY3RvcihcbiAgICAgICAgICAgIGV2ZW50Lm9mZnNldFggLyB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICBldmVudC5vZmZzZXRZIC8gdGhpcy5zaXplRmFjdG9yXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBwb3NcbiAgICB9XG5cbiAgICBjbGVhclNjcmVlbigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdGF0aWNDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgICAgICB0aGlzLmR5bmFtaWNDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgIH1cblxuICAgIGRlZlN0YXRpY0xheWVyKCk6IHZvaWQge1xuICAgICAgICAvLyBnZXQgY2FudmFzXG4gICAgICAgIGNvbnN0IHN0YUNhbnZhczogSFRNTEVsZW1lbnR8bnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXllcjEnKTtcbiAgICAgICAgaWYoc3RhQ2FudmFzKSB0aGlzLnN0YXRpY0NhbnZhcyA9IHN0YUNhbnZhcyBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3RhdGljIGNhbnZhcyBlbGVtZW50IHdhcyBudWxsIVwiKVxuXG4gICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLndpZHRoID0gdGhpcy5yZWFsV2lkdGg7XG4gICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLmhlaWdodCA9IHRoaXMucmVhbEhlaWdodDtcblxuICAgICAgICAvLyBnZXQgY3R4XG4gICAgICAgIGNvbnN0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfG51bGwgPVxuICAgICAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYoY3R4KSB0aGlzLnN0YXRpY0N0eCA9IGN0eCBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN0YXRpYyBjb250ZXh0IHdhcyBudWxsIVwiKVxuXG4gICAgICAgIC8vIGRpc2FibGUgc21vb3RoaW5nIG91dCBwaXhlbHNcbiAgICAgICAgdGhpcy5zdGF0aWNDdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVTdGF0aWNMYXllcigpIHtcbiAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aDtcbiAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMuaGVpZ2h0ID0gdGhpcy5yZWFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIHRoZSBjdHggaGFzIHRvIGJlIGZldGNoZWQgYWdhaW4sIG90aGVyd2lzZSB0aGUgaW1hZ2Ugd2lsbCBnZXQgYmx1cnJ5IGZvciBzb21lIHJlYXNvbi5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuc3RhdGljQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmKGN0eCkgdGhpcy5zdGF0aWNDdHggPSBjdHggYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdGF0aWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuc3RhdGljQ3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRyYXdTdGF0aWNMYXllcigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5zdGF0aWNDdHg7XG4gICAgICAgIGNvbnN0IHJlbmRlciA9IG5ldyBJbWFnZSgpO1xuICAgICAgICByZW5kZXIuc3JjID0gQ2xhc3Nyb29tUmVuZGVyO1xuICAgICAgICBjdHguZHJhd0ltYWdlKHJlbmRlciwgdGhpcy5sZWZ0LCB0aGlzLnRvcCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWZEeW5hbWljTGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIC8vIGdldCBjYW52YXNcbiAgICAgICAgY29uc3QgZHluQ2FudmFzOiBIVE1MRWxlbWVudHxudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xheWVyMicpO1xuICAgICAgICBpZihkeW5DYW52YXMpIHRoaXMuZHluYW1pY0NhbnZhcyA9IGR5bkNhbnZhcyBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRHluYW1pYyBjYW52YXMgZWxlbWVudCB3YXMgbnVsbCFcIilcblxuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aDtcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLmhlaWdodCA9IHRoaXMucmVhbEhlaWdodDtcblxuICAgICAgICAvLyByZWdpc3RlciBpbnRlcmFjdGlvbiBldmVudHNcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLm9uY2xpY2sgPSB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVIb3ZlcihlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZ2V0IGN0eFxuICAgICAgICBjb25zdCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRHxudWxsID1cbiAgICAgICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuZHluYW1pY0N0eCA9IGN0eCBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkR5bmFtaWMgY29udGV4dCB3YXMgbnVsbCFcIilcblxuICAgICAgICAvLyBkaXNhYmxlIHNtb290aGluZyBvdXQgcGl4ZWxzXG4gICAgICAgIHRoaXMuZHluYW1pY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZUR5bmFtaWNMYXllcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLndpZHRoID0gdGhpcy5yZWFsV2lkdGg7XG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gdGhlIGN0eCBoYXMgdG8gYmUgZmV0Y2hlZCBhZ2Fpbiwgb3RoZXJ3aXNlIHRoZSBpbWFnZSB3aWxsIGdldCBibHVycnkgZm9yIHNvbWUgcmVhc29uLlxuICAgICAgICAvLyBnZXQgY3R4XG4gICAgICAgIGNvbnN0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfG51bGwgPVxuICAgICAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmKGN0eCkgdGhpcy5keW5hbWljQ3R4ID0gY3R4IGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRHluYW1pYyBjb250ZXh0IHdhcyBudWxsIVwiKVxuXG4gICAgICAgIC8vIGRpc2FibGUgc21vb3RoaW5nIG91dCBwaXhlbHNcbiAgICAgICAgdGhpcy5keW5hbWljQ3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRyYXdEeW5hbWljTGF5ZXIoKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuZHluYW1pY0N0eDtcblxuICAgICAgICAgLy8gdGhpcyBoYXMgdG8gYmUgZG9uZSB0d28gdGltZXMgc28gaSBwYWNrYWdlZCBpdCBpbiBhIGZ1bmNcbiAgICAgICAgZnVuY3Rpb24gZHJhd0R5bk9iaihzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICAgICAgICAgIHNjZW5lLmR5bmFtaWNPYmplY3RzLnNvcnQoKGEsIGIpID0+IChhLnBvc2l0aW9uLnkgPiBiLnBvc2l0aW9uLnkpID8gMSA6IC0xKSAvLyByZW5kZXIgbG93ZXIgcG9zaXRpb25zIGluIGZyb250XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGR5bk9iaiBvZiBzY2VuZS5keW5hbWljT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGR5bk9iai5kcmF3KGN0eCwgc2NlbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGlnaHQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgbGlnaHQuc3JjID0gQ2xhc3Nyb29tTGlnaHQ7XG4gICAgICAgIGRyYXdEeW5PYmoodGhpcyk7XG4gICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc29mdC1saWdodCc7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UobGlnaHQsIHRoaXMubGVmdCwgdGhpcy50b3AsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NjcmVlbic7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UobGlnaHQsIHRoaXMubGVmdCwgdGhpcy50b3AsIHRoaXMucmVhbFdpZHRoLCB0aGlzLnJlYWxIZWlnaHQpO1xuICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLWF0b3AnO1xuICAgICAgICBkcmF3RHluT2JqKHRoaXMpO1xuXG4gICAgICAgIGlmIChHbG9iYWxzLkRFQlVHKSB7XG4gICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICAgICAgICAgIC8vIGRyYXcgaW50ZXJhY3RpdmVzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlPYmogb2YgdGhpcy5pbnRlcmFjdGl2ZU9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdyc7XG5cbiAgICAgICAgICAgICAgICAvLyBtYXJrIGhvdmVyZWQgb2JqZWN0cyBpbiByZWRcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyTW91c2VQb3M6IFZlY3RvciA9IEdsb2JhbHMuZ2V0Q3VycmVudE1vdXNlUG9zKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNXaXRoaW5JbnRlcmFjdGl2ZU9iamVjdChjdXJyTW91c2VQb3MsaU9iaikpXG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnO1xuXG4gICAgICAgICAgICAgICAgY3R4LnJlY3QoXG4gICAgICAgICAgICAgICAgICAgIGlPYmoucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgaU9iai5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBpT2JqLndpZHRoICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBpT2JqLmhlaWdodCAqIHRoaXMuc2l6ZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkcmF3IHJvdXRlIGdyYXBoXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcy5yb3V0ZUdyYXBoLm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgLy8gZHJhdyBwYXRocyB0byBuZWlnaGJ1cnNcbiAgICAgICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbiBvZiBub2RlLm5laWdoYm91cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICBjdHgubW92ZVRvKG5vZGUucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3Rvciwgbm9kZS5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhuLnBvc2l0aW9uLnggKiB0aGlzLnNpemVGYWN0b3IsIG4ucG9zaXRpb24ueSAqIHRoaXMuc2l6ZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBkcmF3IG5vZGVzXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnZ3JlZW4nO1xuXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAobm9kZS5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yKSAtIDMgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucG9zaXRpb24ueSAqIHRoaXMuc2l6ZUZhY3RvciAtIDMgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIDYgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIDYgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZHJhdyBkeW5hbWljc1xuICAgICAgICAgICAgZm9yIChjb25zdCBkeW5PYmogb2YgdGhpcy5keW5hbWljT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcDogVmVjdG9yID0gZHluT2JqLmdldFBvcygpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgcC54ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBwLnkgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIDMgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIDMgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICAgICAgICAgIC8vIGRyYXcgcm91dGluZyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBkeW5PYmoubW92ZW1lbnRSb3V0ZS5sZW5ndGg7ICBpIDwgbGVuOyAgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBkeW5PYmoubW92ZW1lbnRSb3V0ZVtpXTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3B1cnBsZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgNCAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIDQgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dE5vZGUgPSBkeW5PYmoubW92ZW1lbnRSb3V0ZVtpKzFdO1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAncHVycGxlJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHROb2RlID09PSBkeW5PYmoucm91dGVQb3NpdGlvbikgY3R4LnN0cm9rZVN0eWxlID0gJ2xpZ2h0Ymx1ZSc7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8obm9kZS5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLCBub2RlLnBvc2l0aW9uLnkgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhuZXh0Tm9kZS5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLCBuZXh0Tm9kZS5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVJvdXRlR3JhcGgoKSB7XG4gICAgICAgIGNvbnN0IG5vZGVzOiBSb3V0ZU5vZGVbXSA9IFtdO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBuZXcgbm9kZSBhbmQgYWRkIHRvIGxpc3RcbiAgICAgICAgZnVuY3Rpb24gbm4oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBSb3V0ZU5vZGUge1xuICAgICAgICAgICAgbGV0IG46IFJvdXRlTm9kZSA9IG5ldyBSb3V0ZU5vZGUoeCwgeSk7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKG4pXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYm90dG9tIG9mIHNjcmVlbiwgZG9vciBhbmQgYmVsb3cgcm93c1xuICAgICAgICBsZXQgYXRfZG9vciA9IG5uKDQxOCwgMjg2KTtcbiAgICAgICAgbGV0IGJlbG93X2ZpcnN0X3JvdyA9IG5uKDM1OCwgMjg2KTtcbiAgICAgICAgYXRfZG9vci5hZGRCaWROZWlnaGJvdXIoYmVsb3dfZmlyc3Rfcm93KTtcblxuICAgICAgICBsZXQgYmVsb3dfc2VjX3JvdyA9IG5uKDI5NCwgMjg2KTtcbiAgICAgICAgYmVsb3dfZmlyc3Rfcm93LmFkZEJpZE5laWdoYm91cihiZWxvd19zZWNfcm93KTtcblxuICAgICAgICBsZXQgYmVsb3dfdGhyZF9yb3cgPSBubigyMzAsIDI4Nik7XG4gICAgICAgIGJlbG93X3NlY19yb3cuYWRkQmlkTmVpZ2hib3VyKGJlbG93X3RocmRfcm93KTtcblxuICAgICAgICAvLyBmaXJzdCByb3dcbiAgICAgICAgbGV0IGZyX2ZpcnN0ID0gbm4oMzU4LCAyNjMpO1xuICAgICAgICBsZXQgZnJfc2VjID0gbm4oMzU4LCAyMzEpO1xuICAgICAgICBsZXQgZnJfdGhyZCA9IG5uKDM1OCwgMTk5KTtcbiAgICAgICAgbGV0IGZyX2ZydGggPSBubigzNTgsIDE2Nyk7XG4gICAgICAgIGJlbG93X2ZpcnN0X3Jvdy5hZGRCaWROZWlnaGJvdXIoZnJfZmlyc3QpO1xuICAgICAgICBmcl9maXJzdC5hZGRCaWROZWlnaGJvdXIoZnJfc2VjKTtcbiAgICAgICAgZnJfc2VjLmFkZEJpZE5laWdoYm91cihmcl90aHJkKTtcbiAgICAgICAgZnJfdGhyZC5hZGRCaWROZWlnaGJvdXIoZnJfZnJ0aCk7XG5cbiAgICAgICAgLy8gc2Vjb25kIHJvd1xuICAgICAgICBsZXQgc2NfZmlyc3QgPSBubigyOTQsIDI2Myk7XG4gICAgICAgIGxldCBzY19zZWMgPSBubigyOTQsIDIzMSk7XG4gICAgICAgIGxldCBzY190aHJkID0gbm4oMjk0LCAxOTkpO1xuICAgICAgICBsZXQgc2NfZnJ0aCA9IG5uKDI5NCwgMTY3KTtcbiAgICAgICAgYmVsb3dfc2VjX3Jvdy5hZGRCaWROZWlnaGJvdXIoc2NfZmlyc3QpO1xuICAgICAgICBzY19maXJzdC5hZGRCaWROZWlnaGJvdXIoc2Nfc2VjKTtcbiAgICAgICAgc2Nfc2VjLmFkZEJpZE5laWdoYm91cihzY190aHJkKTtcbiAgICAgICAgc2NfdGhyZC5hZGRCaWROZWlnaGJvdXIoc2NfZnJ0aCk7XG5cbiAgICAgICAgLy8gdGhpcmQgcm93XG4gICAgICAgIGxldCB0aF9maXJzdCA9IG5uKDIzMCwgMjYzKTtcbiAgICAgICAgbGV0IHRoX3NlYyA9IG5uKDIzMCwgMjMxKTtcbiAgICAgICAgbGV0IHRoX3RocmQgPSBubigyMzAsIDE5OSk7XG4gICAgICAgIGxldCB0aF9mcnRoID0gbm4oMjMwLCAxNjcpO1xuICAgICAgICBiZWxvd190aHJkX3Jvdy5hZGRCaWROZWlnaGJvdXIodGhfZmlyc3QpO1xuICAgICAgICB0aF9maXJzdC5hZGRCaWROZWlnaGJvdXIodGhfc2VjKTtcbiAgICAgICAgdGhfc2VjLmFkZEJpZE5laWdoYm91cih0aF90aHJkKTtcbiAgICAgICAgdGhfdGhyZC5hZGRCaWROZWlnaGJvdXIodGhfZnJ0aCk7XG5cbiAgICAgICAgLy8gYWRkIGFsbCB0aGUgbm9kZXMgdG8gdGhlIHNjZW5lcyBncmFwaFxuICAgICAgICB0aGlzLnJvdXRlR3JhcGggPSBuZXcgUm91dGVHcmFwaChub2Rlcyk7XG4gICAgfVxuXG4gICAgY3JlYXRlUGxheWVyKCkge1xuICAgICAgICAvLyBnZXQgc3ByaXRlXG4gICAgICAgIGNvbnN0IHVzZXJDaGFyYWN0ZXJTcHJpdGU6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdXNlckNoYXJhY3RlclNwcml0ZS5zcmMgPSBGZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3Q7XG5cbiAgICAgICAgY29uc3QgdXNlckNoYXJhY3RlcjogRHluYW1pY09iamVjdCA9IG5ldyBEeW5hbWljT2JqZWN0KDMyLCAzMiwgdXNlckNoYXJhY3RlclNwcml0ZSwgdGhpcy5yb3V0ZUdyYXBoLm5vZGVzWzBdKTtcbiAgICAgICAgdXNlckNoYXJhY3Rlci5zZXRNb3ZlbWVudFNwZWVkKDMwKTtcbiAgICAgICAgdXNlckNoYXJhY3Rlci5hZGRBbmltYXRpb25Nb2RlKCd3YWxraW5nJyxcbiAgICAgICAgICAgIG5ldyBBbmltYXRpb25Nb2RlKFxuICAgICAgICAgICAgICAgIEhlbHBlci5QYXRoc1RvSW1ncyhbRmVtYWxlc3R1ZGVudHdhbGtpbmdub3J0aCwgRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0LCBGZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoLCBGZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3RdKSxcbiAgICAgICAgICAgICAgICA4LCA1LjVcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgdXNlckNoYXJhY3Rlci5hZGRBbmltYXRpb25Nb2RlKCdpZGxlJyxcbiAgICAgICAgICAgIG5ldyBBbmltYXRpb25Nb2RlKCAvLyBUT0RPOiBwdXQgYWN0dWFsIGlkbGUgYW5pbWF0aW9ucyBoZXJlIGdvZGRhbW5cbiAgICAgICAgICAgICAgICBIZWxwZXIuUGF0aHNUb0ltZ3MoW0ZlbWFsZXN0dWRlbnR3YWxraW5nbm9ydGgsIEZlbWFsZXN0dWRlbnR3YWxraW5nd2VzdCwgRmVtYWxlc3R1ZGVudHdhbGtpbmdzb3V0aCwgRmVtYWxlc3R1ZGVudHdhbGtpbmdlYXN0XSksXG4gICAgICAgICAgICAgICAgOCwgNS41XG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIHVzZXJDaGFyYWN0ZXIuYWRkQW5pbWF0aW9uTW9kZSgnc2l0dGluZycsXG4gICAgICAgICAgICBuZXcgQW5pbWF0aW9uTW9kZSggLy8gVE9ETzogbWFrZSBkaXJlY3Rpb25hbCBzaXR0aW5nIGFuaW1hdGlvbnNcbiAgICAgICAgICAgICAgICBIZWxwZXIuUGF0aHNUb0ltZ3MoW0ZlbWFsZXN0dWRlbnRzaXR0aW5nLCBGZW1hbGVzdHVkZW50c2l0dGluZywgRmVtYWxlc3R1ZGVudHNpdHRpbmcsIEZlbWFsZXN0dWRlbnRzaXR0aW5nXSksXG4gICAgICAgICAgICAgICAgMSwgMFxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucGxheWVyT2JqZWN0ID0gdXNlckNoYXJhY3RlcjtcbiAgICAgICAgdGhpcy5keW5hbWljT2JqZWN0cy5wdXNoKHVzZXJDaGFyYWN0ZXIpO1xuICAgIH1cblxuICAgIGRlZkdhbWVMb2dpYygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jcmVhdGVSb3V0ZUdyYXBoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlUGxheWVyKCk7XG4gICAgICAgIC8vIGRlZmluZSBjaGFpciB6b25lc1xuICAgICAgICAvLyBmb3IgZWFjaCBjaGFpcjogW3VwcGVyLWxlZnRdLCB3aWR0aCwgaGVpZ2h0XG4gICAgICAgIGNvbnN0IGNoYWlyWm9uZXM6IEFycmF5PFtWZWN0b3IsIG51bWJlciwgbnVtYmVyXT4gPSBbXG4gICAgICAgICAgICAvLyBiYWNrICgzdGgpIHJvd1xuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAyMzcpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAyMDQpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAxNzQpLCAzNCwgMzBdLFxuICAgICAgICAgICAgW25ldyBWZWN0b3IoMjQ2LCAxNDIpLCAzNCwgMzBdLFxuICAgICAgICAgICAgLy8gMmQgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzMTAsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgICAgICAvLyAxc3Qgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigzNzQsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgem9uZSBvZiBjaGFpclpvbmVzKVxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZU9iamVjdHMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgSW50ZXJhY3RpdmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMF0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMV0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMl0pKTtcbiAgICAgICAgZm9yIChjb25zdCB6b25lIG9mIGNoYWlyWm9uZXMpXG4gICAgICAgICAgICB0aGlzLmNoYWlyWm9uZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgSW50ZXJhY3RpdmVPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMF0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMV0sXG4gICAgICAgICAgICAgICAgICAgIHpvbmVbMl0pKTtcbiAgICB9XG5cbiAgICBydW5HYW1lTG9vcCgpOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBvIG9mIHRoaXMuZHluYW1pY09iamVjdHMpIHtcbiAgICAgICAgICAgIG8ubW92ZU9uUm91dGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yJztcbmltcG9ydCBHbG9iYWxzIGZyb20gJy4vR2xvYmFscyc7XG5pbXBvcnQgQ2xhc3Nyb29tU2NlbmUgZnJvbSAnLi9DbGFzc3Jvb21TY2VuZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgR2xvYmFscy5zZXRBY3RpdmVTY2VuZShcbiAgICAgICAgbmV3IENsYXNzcm9vbVNjZW5lKFxuICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQpKTtcblxuICAgIEdsb2JhbHMuc2V0QWN0aXZlQW5pbWF0b3IoXG4gICAgICAgIG5ldyBBbmltYXRvcihcbiAgICAgICAgICAgIEdsb2JhbHMuZ2V0QWN0aXZlU2NlbmUoKSkpO1xuICAgICAgICAgICAgR2xvYmFscy5nZXRBY3RpdmVBbmltYXRvcigpLmFuaW1hdGUoKTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgY29uc3QgYWN0aXZlU2NlbmUgPSBHbG9iYWxzLmdldEFjdGl2ZVNjZW5lKCk7XG4gICAgaWYgKGFjdGl2ZVNjZW5lICE9IG51bGwpIHtcbiAgICAgICAgYWN0aXZlU2NlbmUucmVzaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9