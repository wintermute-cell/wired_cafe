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
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};


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
        // if the object already has a route, prepend the current step of the route to the new one.
        if (this.movementRoute.length > 0)
            this.movementRoute = __spreadArray(__spreadArray([], this.movementRoute.splice(this.stepOfRoute, this.stepOfRoute + 1), true), route, true);
        else
            this.movementRoute = route;
        this.stepOfRoute = 0;
        if (route.length > 0)
            this.distToNextPoint = this.position.distanceTo(route[1].position);
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
                    var nextNode = this.movementRoute[this.stepOfRoute + 1];
                    this.distToNextPoint = this.position.distanceTo(nextNode.position);
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
                ctx.fillRect(p.x * this.sizeFactor, p.y * this.sizeFactor, 3 * this.sizeFactor, 2 * this.sizeFactor);
                ctx.stroke();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsQ0FBQztJQUU3Qiw2QkFBeUIsQ0FDckIsSUFBSSxZQUFRLENBQ1IsMEJBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0IsNkJBQXlCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsRCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO0lBQzlCLElBQU0sV0FBVyxHQUFHLDBCQUFzQixFQUFFLENBQUM7SUFDN0MsSUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO1FBQ3JCLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDN0Q7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9BbmltYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvVmVjdG9yLnRzIiwid2VicGFjazovLy8uL3NyYy9HbG9iYWxzLnRzIiwid2VicGFjazovLy8uL3NyYy9JbnRlcmFjdGl2ZU9iamVjdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvRHluYW1pY09iamVjdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvQW5pbWF0aW9uTW9kZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvSGVscGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9Sb3V0ZUdyYXBoLnRzIiwid2VicGFjazovLy8uL3NyYy9XVmVjdG9yLnRzIiwid2VicGFjazovLy8uL3NyYy9Sb3V0ZU5vZGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0NsYXNzcm9vbVNjZW5lLnRzIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5pbWF0b3Ige1xuICAgIF9zY2VuZTogU2NlbmU7XG4gICAgX2xhc3RUaW1lOiBudW1iZXI7XG4gICAgX2RlbHRhVGltZTogbnVtYmVyO1xuICAgIGN1cnJUaW1lOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBTY2VuZSkge1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2RlbHRhVGltZSA9IDA7XG4gICAgfVxuXG4gICAgX2RyYXdGcmFtZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc2NlbmUuZHJhd1N0YXRpY0xheWVyKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmRyYXdEeW5hbWljTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBnZXREZWx0YVRpbWUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlbHRhVGltZTtcbiAgICB9XG5cbiAgICBhbmltYXRlKGN1cnJUaW1lOiBudW1iZXIgPSAwKSB7XG4gICAgICAgIHRoaXMuY3VyclRpbWUgPSBjdXJyVGltZTsgLy8gbWFrZSB0aGlzIGF2YWlsYWJsZSBmb3IgdGhlIHNjZW5lXG5cbiAgICAgICAgdGhpcy5fZGVsdGFUaW1lID0gKGN1cnJUaW1lIC0gdGhpcy5fbGFzdFRpbWUpIC8gMTAwMDsgLy8gY29udmVydCBtaWxsaXNlY29uZHMgdG8gc2Vjb25kIGZyYWN0aW9uc1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IGN1cnJUaW1lO1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLnJ1bkdhbWVMb29wKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmNsZWFyU2NyZWVuKCk7XG4gICAgICAgIHRoaXMuX2RyYXdGcmFtZSgpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvciB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICoqIDIgKyB0aGlzLnkgKiogMik7XG4gICAgfVxuXG4gICAgYWRkKG90aGVyOiBWZWN0b3IpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgICAgIHRoaXMueCArIG90aGVyLngsXG4gICAgICAgICAgICB0aGlzLnkgKyBvdGhlci55XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2VUbyhvdGhlcjogVmVjdG9yKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgICAgICAgICh0aGlzLnggLSBvdGhlci54KSAqKiAyICtcbiAgICAgICAgICAgICAgICAodGhpcy55IC0gb3RoZXIueSkgKiogMlxuICAgICAgICApO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZWQoKTogVmVjdG9yIHtcbiAgICAgICAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGgoKTtcbiAgICAgICAgaWYobGVuICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3RvcigwLCAwKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcbmltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yJztcbmltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2xvYmFscyB7XG4gICAgLy8gY29uZmlnIGZpZWxkc1xuICAgIHN0YXRpYyBERUJVRzogYm9vbGVhbiA9IHRydWU7XG5cbiAgICAvLyBtb3VzZSBwb3NpdGlvblxuICAgIHN0YXRpYyBfY3VycmVudE1vdXNlUG9zaXRpb246IFZlY3RvciA9IG5ldyBWZWN0b3IoMCwgMCk7XG4gICAgc3RhdGljIGdldEN1cnJlbnRNb3VzZVBvcygpOiBWZWN0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb247XG4gICAgfVxuICAgIHN0YXRpYyBzZXRDdXJyZW50TW91c2VQb3MocG9zOiBWZWN0b3IpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24gPSBwb3M7XG4gICAgfVxuXG4gICAgLy8gYW5pbWF0b3JcbiAgICBzdGF0aWMgX2FjdGl2ZUFuaW1hdG9yOiBBbmltYXRvcjtcbiAgICBzdGF0aWMgZ2V0QWN0aXZlQW5pbWF0b3IoKTogQW5pbWF0b3Ige1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlQW5pbWF0b3I7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRBY3RpdmVBbmltYXRvcihhbmltOiBBbmltYXRvcik6IHZvaWQge1xuICAgICAgICB0aGlzLl9hY3RpdmVBbmltYXRvciA9IGFuaW07XG4gICAgfVxuXG4gICAgLy8gc2NlbmVcbiAgICBzdGF0aWMgX2FjdGl2ZVNjZW5lOiBTY2VuZTtcbiAgICBzdGF0aWMgZ2V0QWN0aXZlU2NlbmUoKTogU2NlbmUge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlU2NlbmU7XG4gICAgfVxuICAgIHN0YXRpYyBzZXRBY3RpdmVTY2VuZShzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fYWN0aXZlU2NlbmUgPSBzY2VuZTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmFjdGl2ZU9iamVjdCB7XG4gIHBvc2l0aW9uOiBWZWN0b3I7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0aW5nUG9zOiBWZWN0b3IsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHN0YXJ0aW5nUG9zO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgfVxufVxuIiwiaW1wb3J0IEdsb2JhbHMgZnJvbSAnLi9HbG9iYWxzJztcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuaW1wb3J0IFdWZWN0b3IgZnJvbSAnLi9XVmVjdG9yJztcbmltcG9ydCBTY2VuZSBmcm9tICcuL1NjZW5lJztcbmltcG9ydCBBbmltYXRpb25Nb2RlIGZyb20gJy4vQW5pbWF0aW9uTW9kZSc7XG5pbXBvcnQgUm91dGVOb2RlIGZyb20gJy4vUm91dGVOb2RlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHluYW1pY09iamVjdCB7XG5cbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG5cbiAgc3ByaXRlOiBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIGN1cnJBbmltYXRpb25Nb2RlITogQW5pbWF0aW9uTW9kZTtcbiAgYW5pbWF0aW9uTW9kZXM6IHsgW2tleTogc3RyaW5nXTogQW5pbWF0aW9uTW9kZSB9ID0ge307XG5cbiAgc3ByaXRlU2l0dGluZyE6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgcG9zaXRpb24hOiBXVmVjdG9yOyAvLyBjdXJyZW50IHgsIHkgcG9zaXRpb25cbiAgcm91dGVQb3NpdGlvbjogUm91dGVOb2RlO1xuXG4gIG1vdmVtZW50Um91dGU6IFJvdXRlTm9kZVtdID0gW107IC8vIGEgbGlzdCBvZiB4LCB5IHBvc2l0aW9uIG9iamVjdHNcbiAgc3RlcE9mUm91dGU6IG51bWJlciA9IDA7IC8vIGFuIGluZGV4IG9mIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBhYm92ZSByb3V0ZVxuICBtb3ZlbWVudFNwZWVkOiBudW1iZXI7XG4gIGRpc3RUb05leHRQb2ludDogbnVtYmVyID0gMDtcblxuICAvLyB0aGlzIGlzIHVzZWQgdG8gY2hlY2sgd2hlbiB0aGUgYW5pbWF0ZSBtZXRob2Qgd2FzIGxhc3QgY2FsbGVkXG4gIC8vIHRvIHByZXZlbnQgZG91YmxlIGFuaW1hdGlvbiBjYWxscyBpbiBvbmUgZnJhbWVcbiAgbGFzdFRpbWU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaGVpZ2h0OiBudW1iZXIsXG4gICAgICAgICAgICAgIHdpZHRoOiBudW1iZXIsXG4gICAgICAgICAgICAgIHNwcml0ZTogSFRNTEltYWdlRWxlbWVudCxcbiAgICAgICAgICAgICAgcm91dGVQb3NpdGlvbjogUm91dGVOb2RlKSB7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuICAgIHRoaXMucm91dGVQb3NpdGlvbiA9IHJvdXRlUG9zaXRpb247XG4gICAgdGhpcy5zZXRQb3Mocm91dGVQb3NpdGlvbi5wb3NpdGlvbi54LCByb3V0ZVBvc2l0aW9uLnBvc2l0aW9uLnkpXG4gICAgdGhpcy5tb3ZlbWVudFNwZWVkID0gMDtcbiAgfVxuXG4gIGFkZEFuaW1hdGlvbk1vZGUobmFtZTogc3RyaW5nLCBtb2RlOiBBbmltYXRpb25Nb2RlKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJBbmltYXRpb25Nb2RlKSB0aGlzLmN1cnJBbmltYXRpb25Nb2RlID0gbW9kZTsgLy8gdGhlIGZpcnN0IGFzc2lnbmVkIGFuaW1hdGlvbiBtb2RlIGJlY29tZXMgdGhlIGluaXRpYWwgbW9kZVxuICAgIHRoaXMuYW5pbWF0aW9uTW9kZXNbbmFtZV0gPSBtb2RlO1xuICB9XG5cbiAgc2V0TW92ZW1lbnRSb3V0ZShyb3V0ZTogUm91dGVOb2RlW10pIHtcbiAgICAvLyBpZiB0aGUgb2JqZWN0IGFscmVhZHkgaGFzIGEgcm91dGUsIHByZXBlbmQgdGhlIGN1cnJlbnQgc3RlcCBvZiB0aGUgcm91dGUgdG8gdGhlIG5ldyBvbmUuXG4gICAgaWYgKHRoaXMubW92ZW1lbnRSb3V0ZS5sZW5ndGggPiAwKSB0aGlzLm1vdmVtZW50Um91dGUgPVxuICAgICAgWy4uLnRoaXMubW92ZW1lbnRSb3V0ZS5zcGxpY2UodGhpcy5zdGVwT2ZSb3V0ZSx0aGlzLnN0ZXBPZlJvdXRlKzEpICwuLi5yb3V0ZV07XG4gICAgZWxzZSB0aGlzLm1vdmVtZW50Um91dGUgPSByb3V0ZTtcblxuICAgIHRoaXMuc3RlcE9mUm91dGUgPSAwO1xuICAgIGlmIChyb3V0ZS5sZW5ndGggPiAwKSB0aGlzLmRpc3RUb05leHRQb2ludCA9IHRoaXMucG9zaXRpb24uZGlzdGFuY2VUbyhyb3V0ZVsxXS5wb3NpdGlvbik7XG4gIH1cblxuICBzZXRNb3ZlbWVudFNwZWVkKHNwZWVkOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVtZW50U3BlZWQgPSBzcGVlZDtcbiAgfVxuXG4gIHNldFBvcyh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGFkanVzdGVkUG9zOiBWZWN0b3IgPSBuZXcgVmVjdG9yKHgsIHkpO1xuICAgIGFkanVzdGVkUG9zLnggLT0gdGhpcy53aWR0aCAvIDI7XG4gICAgYWRqdXN0ZWRQb3MueSAtPSB0aGlzLmhlaWdodDtcbiAgICB0aGlzLnBvc2l0aW9uID0gYWRqdXN0ZWRQb3M7XG4gIH1cblxuICBnZXRQb3MoKTogVmVjdG9yIHtcbiAgICBjb25zdCBwID0gbmV3IFZlY3Rvcih0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gICAgcC54ICs9IHRoaXMud2lkdGggLyAyO1xuICAgIHAueSArPSB0aGlzLmhlaWdodDtcbiAgICByZXR1cm4gcFxuICB9XG5cbiAgc2VsZWN0U3ByaXRlKGRpcmVjdGlvbjogVmVjdG9yKTogdm9pZCB7XG4gICAgLy9pZiAoZGlyZWN0aW9uLnggPT09IDAgJiYgZGlyZWN0aW9uLnkgPT09IDApIHtcbiAgICAvLyAgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNJZGxlWzJdO1xuICAgIC8vfSBlbHNlIGlmIChNYXRoLmFicyhkaXJlY3Rpb24ueCkgPiBNYXRoLmFicyhkaXJlY3Rpb24ueSkpIHtcbiAgICAvLyAgLy8gaG9yaXpvbnRhbCBtb3ZlbWVudCBpcyBzdHJvbmdlclxuICAgIC8vICBpZiAoZGlyZWN0aW9uLnggPiAwKSB0aGlzLnNwcml0ZSA9IHRoaXMuc3ByaXRlc1dhbGtbM107XG4gICAgLy8gIGVsc2UgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNXYWxrWzFdO1xuICAgIC8vfSBlbHNlIHtcbiAgICAvLyAgLy8gdmVydGljYWwgbW92ZW1lbnQgaXMgc3Ryb25nZXJcbiAgICAvLyAgaWYgKGRpcmVjdGlvbi55ID4gMCkgdGhpcy5zcHJpdGUgPSB0aGlzLnNwcml0ZXNXYWxrWzJdO1xuICAgIC8vICBlbHNlIHRoaXMuc3ByaXRlID0gdGhpcy5zcHJpdGVzV2Fsa1swXTtcbiAgICAvL31cbiAgfVxuXG4gIG1vdmVPblJvdXRlKCk6IHZvaWQge1xuICAgIC8vIGlmIHRoZSBlbmQgb2YgdGhlIHJvdXRlIGhhcyBiZWVuIHJlYWNoZWQsIG5vIG1vdmVtZW50IGlzIHJlcXVpcmVkLiBpbnN0ZWFkLCBjbGVhciB0aGUgY3VycmVudCByb3V0ZVxuICAgIGlmICh0aGlzLnN0ZXBPZlJvdXRlID49IHRoaXMubW92ZW1lbnRSb3V0ZS5sZW5ndGgtMSkge1xuICAgICAgdGhpcy5zdGVwT2ZSb3V0ZSA9IDA7XG4gICAgICB0aGlzLm1vdmVtZW50Um91dGUgPSBbXVxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWx0YVRpbWU6IG51bWJlciA9IEdsb2JhbHMuZ2V0QWN0aXZlQW5pbWF0b3IoKS5nZXREZWx0YVRpbWUoKTsgLy8gd2lsbCBiZSB1c2VkIGEgY291cGxlIG9mIHRpbWVzLCBzbyBzaG9ydCBuYW1lIGlzIGJldHRlclxuICAgICAgY29uc3QgdGFyZ2V0OiBXVmVjdG9yID0gdGhpcy5tb3ZlbWVudFJvdXRlW3RoaXMuc3RlcE9mUm91dGUgKyAxXS5wb3NpdGlvbjsgIC8vIHRoZSBjdXJyZW50IG5leHQgbm9kZSBpbiB0aGUgcm91dGVcblxuICAgICAgLy8gY2hlY2sgaWYgdGhlIG5leHQgc3RlcCB3b3VsZCByZWFjaCB0aGUgdGFyZ2V0XG4gICAgICBjb25zdCBsb29rQWhlYWREaXN0YW5jZSA9IHRoaXMuZGlzdFRvTmV4dFBvaW50IC0gKHRoaXMubW92ZW1lbnRTcGVlZCAqIGRlbHRhVGltZSk7XG4gICAgICBpZiAobG9va0FoZWFkRGlzdGFuY2UgPD0gMCkge1xuICAgICAgICB0aGlzLnNldFBvcyh0YXJnZXQueCwgdGFyZ2V0LnkpO1xuICAgICAgICB0aGlzLnN0ZXBPZlJvdXRlKys7XG5cbiAgICAgICAgLy8gcHJlcGFyZSBmb3IgdGhlIG5leHQgcGFydCBvZiB0aGUgcm91dGVcbiAgICAgICAgaWYgKHRoaXMuc3RlcE9mUm91dGUgPCB0aGlzLm1vdmVtZW50Um91dGUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMucm91dGVQb3NpdGlvbiA9IHRoaXMubW92ZW1lbnRSb3V0ZVt0aGlzLnN0ZXBPZlJvdXRlKzFdOyAvLyB0aGUgcm91dGUgcG9zaXRpb24gaXMgYWx3YXlzIHRoZSB0YXJnZXQgb2YgdGhlIHdhbGtcbiAgICAgICAgICBjb25zdCBuZXh0Tm9kZTogUm91dGVOb2RlID0gdGhpcy5tb3ZlbWVudFJvdXRlW3RoaXMuc3RlcE9mUm91dGUrMV07XG4gICAgICAgICAgdGhpcy5kaXN0VG9OZXh0UG9pbnQgPSB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlVG8obmV4dE5vZGUucG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2luY2UgdGhpcyBzdGVwIHdpbGwgbm90IHJlYWNoIHRoZSB0YXJnZXQsIGp1c3QgbW92ZSBhcyBleHBlY3RlZFxuICAgICAgICBjb25zdCBjdXJyUG9zOiBXVmVjdG9yID0gdGhpcy5nZXRQb3MoKTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gbmV3IFZlY3RvcihcbiAgICAgICAgICB0YXJnZXQueCAtIGN1cnJQb3MueCxcbiAgICAgICAgICB0YXJnZXQueSAtIGN1cnJQb3MueSxcbiAgICAgICAgKTtcblxuICAgICAgLy8gbm9ybWFsaXppbmcgdGhlIGRpcmVjdGlvbiB2ZWN0b3JcbiAgICAgIGNvbnN0IG5EaXJlY3Rpb246IFZlY3RvciA9IGRpcmVjdGlvbi5ub3JtYWxpemVkKCk7XG4gICAgICAgIC8vIGlmIHRoZSByb3V0ZSBwb2ludCBoYXMgbm90IGJlZW4gcmVhY2hlZFxuICAgICAgICBjb25zdCBwOiBXVmVjdG9yID0gdGhpcy5nZXRQb3MoKTtcbiAgICAgICAgdGhpcy5zZXRQb3MoXG4gICAgICAgICAgcC54ICsgbkRpcmVjdGlvbi54ICogZGVsdGFUaW1lICogdGhpcy5tb3ZlbWVudFNwZWVkLFxuICAgICAgICAgIHAueSArIG5EaXJlY3Rpb24ueSAqIGRlbHRhVGltZSAqIHRoaXMubW92ZW1lbnRTcGVlZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5kaXN0VG9OZXh0UG9pbnQgPSBwLmRpc3RhbmNlVG8odGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhbmltYXRlKCk6IHZvaWQge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmFuaW1hdGlvbk1vZGVzKS5sZW5ndGggPD0gMCkge1xuICAgICAgY29uc29sZS5sb2coXCJUcmllZCB0byBhbmltYXRlIGR5bmFtaWMgb2JqZWN0IHdpdGhvdXQgYW55IGFzc2lnbmVkIGFuaW1hdGlvbk1vZGVzIVwiKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHByZXZlbnQgYW5pbWF0aW9uIGZyb20gcHJvZ3Jlc3NpbmcgbXVsdGlwbGUgdGltZXMgZWFjaCBmcmFtZVxuICAgIC8vIGlmIHRoZSBvYmogaXMgcmVuZGVyZWQgbXVsdGlwbGUgdGltZXMgYnkgY29tcGFyaW5nIHRoZSBsYXN0IHRpbWVzdGFtcCB3aXRoIHRoZSBjdXJyZW50IG9uZVxuICAgIGlmICh0aGlzLmxhc3RUaW1lICE9PSBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuY3VyclRpbWUpIHtcbiAgICAgIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCArPVxuICAgICAgICAgIEdsb2JhbHMuZ2V0QWN0aXZlQW5pbWF0b3IoKS5nZXREZWx0YVRpbWUoKSAqIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3BlZWQ7XG4gICAgICBpZiAodGhpcy5jdXJyQW5pbWF0aW9uTW9kZS5hbmltYXRpb25TdGVwID4gdGhpcy5jdXJyQW5pbWF0aW9uTW9kZS5hbmltYXRpb25GcmFtZXMpIHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCA9IDA7XG4gICAgfVxuICAgIHRoaXMubGFzdFRpbWUgPSBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuY3VyclRpbWU7XG4gIH1cblxuICBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzY2VuZTogU2NlbmUpOiB2b2lkIHtcbiAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgdGhpcy5zcHJpdGUsXG4gICAgICBNYXRoLmZsb29yKHRoaXMuY3VyckFuaW1hdGlvbk1vZGUuYW5pbWF0aW9uU3RlcCkgKiB0aGlzLndpZHRoLCAwLFxuICAgICAgMzIsIDMyLFxuICAgICAgdGhpcy5wb3NpdGlvbi54ICogc2NlbmUuc2l6ZUZhY3RvcixcbiAgICAgIHRoaXMucG9zaXRpb24ueSAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgICB0aGlzLmhlaWdodCAqIHNjZW5lLnNpemVGYWN0b3IsXG4gICAgICB0aGlzLndpZHRoICogc2NlbmUuc2l6ZUZhY3RvcixcbiAgICApO1xuICAgIHRoaXMuYW5pbWF0ZSgpO1xuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBBbmltYXRpb25Nb2RlIHtcbiAgICAvLyBOLCBXLCBTLCBFXG4gICAgc3ByaXRlU2V0czogSFRNTEltYWdlRWxlbWVudFtdO1xuXG4gICAgY3VyckRpcmVjdGlvbjogbnVtYmVyID0gMjsgLy8gZGVmYXVsdCBzb3V0aCBmYWNpbmdcblxuICAgIGFuaW1hdGlvblN0ZXA6IG51bWJlciA9IDA7IC8vIGN1cnJlbnQgYW5pbWF0aW9uIGZyYW1lIG9mIHRoZSBzcHJpdGUtc2hlZXRcbiAgICBhbmltYXRpb25GcmFtZXM6IG51bWJlcjsgLy8gdG90YWwgYW1vdW50IG9mIGFuaW1hdGlvbiBmcmFtZXMgaW4gc3ByaXRlLXNoZWV0XG4gICAgYW5pbWF0aW9uU3BlZWQ6IG51bWJlcjsgLy8gYW5pbWF0aW9uIGZyYW1lcyBwZXIgc2Vjb25kXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc3ByaXRlU2V0czogSFRNTEltYWdlRWxlbWVudFtdLFxuICAgICAgICBhbmltYXRpb25TcGVlZDogbnVtYmVyLCBhbmltYXRpb25GcmFtZXM6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNwcml0ZVNldHMgPSBzcHJpdGVTZXRzO1xuICAgICAgICB0aGlzLmFuaW1hdGlvblNwZWVkID0gYW5pbWF0aW9uU3BlZWQ7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVzID0gYW5pbWF0aW9uRnJhbWVzO1xuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgIHN0YXRpYyBQYXRoVG9JbWcocGF0aDogc3RyaW5nKTogSFRNTEltYWdlRWxlbWVudCB7XG4gICAgICAgIGxldCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLnNyYyA9IHBhdGg7XG4gICAgICAgIHJldHVybiBpbWdcbiAgICB9XG5cbiAgICBzdGF0aWMgUGF0aHNUb0ltZ3MocGF0aHM6IHN0cmluZ1tdKTogSFRNTEltYWdlRWxlbWVudFtdIHtcbiAgICAgICAgbGV0IGltZ3M6IEhUTUxJbWFnZUVsZW1lbnRbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGltZzogSFRNTEltYWdlRWxlbWVudCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHBhdGg7XG4gICAgICAgICAgICBpbWdzLnB1c2goaW1nKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWdzXG4gICAgfVxufVxuIiwiaW1wb3J0IFJvdXRlTm9kZSBmcm9tICcuL1JvdXRlTm9kZSc7XG5pbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm91dGVHcmFwaCB7XG4gICAgbm9kZXM6IFJvdXRlTm9kZVtdO1xuXG4gICAgY29uc3RydWN0b3Iobm9kZXM6IFJvdXRlTm9kZVtdKSB7XG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIGNsb3Nlc3Qgbm9kZSBpbiB0aGUgZ3JhcGggdG8gYSBnaXZlbiBhcmJpdHJhcnkgcG9zaXRpb24gb24gdGhlIHNjcmVlblxuICAgIGdldENsb3Nlc3ROb2RlVG8ocG9zaXRpb246IFZlY3Rvcik6IFJvdXRlTm9kZSB7XG4gICAgICAgIGxldCBjbG9zZXN0OiBSb3V0ZU5vZGUgPSB0aGlzLm5vZGVzWzBdO1xuICAgICAgICBsZXQgbWluRGlzdDogbnVtYmVyID0gdGhpcy5ub2Rlc1swXS5wb3NpdGlvbi5kaXN0YW5jZVRvKHBvc2l0aW9uKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGxldCBkOiBudW1iZXIgPSBub2RlLnBvc2l0aW9uLmRpc3RhbmNlVG8ocG9zaXRpb24pO1xuICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0KSB7XG4gICAgICAgICAgICAgICAgbWluRGlzdCA9IGQ7XG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsb3Nlc3Q7XG4gICAgfVxuXG5cbiAgICAvLyBzaGl0dHkgcmFuZG9taXplZCByb3V0aW5nIGFsZ28uIGRvZXNudCBmaW5kIHNob3J0ZXN0IHJvdXRlLCBidXQgcHJvdmlkZXMgdmFyaWV0eVxuICAgIGdldFJvdXRlKGZyb206IFJvdXRlTm9kZSwgdG86IFJvdXRlTm9kZSk6IFJvdXRlTm9kZVtdIHtcbiAgICAgICAgaWYgKGZyb20gPT09IHRvKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VycmVudE5vZGU6IFJvdXRlTm9kZSA9IGZyb207XG4gICAgICAgIGxldCBjdXJyUm91dGU6IFJvdXRlTm9kZVtdID0gW2Zyb21dO1xuICAgICAgICBsZXQgdmlzaXRlZE5vZGVzOiBSb3V0ZU5vZGVbXSA9IFtmcm9tXTtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnROb2RlICE9PSB0bykgeyAvLyBpZiB0YXJnZXQgaXMgcmVhY2hlZCwgZW5kIHRoZSBzZWFyY2hcbiAgICAgICAgICAgIGxldCBjb2xsYXBzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGN1cnJlbnROb2RlLm5laWdoYm91cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbjogUm91dGVOb2RlID0gY3VycmVudE5vZGUubmVpZ2hib3Vyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoIXZpc2l0ZWROb2Rlcy5pbmNsdWRlcyhuKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZSA9IG47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyUm91dGVbY3VyclJvdXRlLmxlbmd0aC0yXTtcbiAgICAgICAgICAgICAgICAgICAgY3VyclJvdXRlLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb2xsYXBzZSkge1xuICAgICAgICAgICAgICAgIGN1cnJSb3V0ZS5wdXNoKGN1cnJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICB2aXNpdGVkTm9kZXMucHVzaChjdXJyZW50Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VyclJvdXRlO1xuICAgIH1cbn1cbiIsImltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3InO1xuXG4vLyB3b3JsZCBzcGFjZSB2ZWN0b3JcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdWZWN0b3IgZXh0ZW5kcyBWZWN0b3IgeyB9XG4iLCJpbXBvcnQgV1ZlY3RvciBmcm9tICcuL1dWZWN0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3V0ZU5vZGUge1xuICAgIHBvc2l0aW9uOiBXVmVjdG9yO1xuICAgIG5laWdoYm91cnM6IFJvdXRlTm9kZVtdO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBXVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLm5laWdoYm91cnMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGROZWlnaGJvdXIobjogUm91dGVOb2RlKSB7XG4gICAgICAgIHRoaXMubmVpZ2hib3Vycy5wdXNoKG4pO1xuICAgIH1cblxuICAgIC8vIGFkZE5laWdoYm91ciBpbiBib3RoIGRpcmVjdGlvbnNcbiAgICBhZGRCaWROZWlnaGJvdXIobjogUm91dGVOb2RlKSB7XG4gICAgICAgIHRoaXMubmVpZ2hib3Vycy5wdXNoKG4pO1xuICAgICAgICBuLm5laWdoYm91cnMucHVzaCh0aGlzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi9TY2VuZSc7XG5pbXBvcnQgVmVjdG9yIGZyb20gJy4vVmVjdG9yJztcbmltcG9ydCBJbnRlcmFjdGl2ZU9iamVjdCBmcm9tICcuL0ludGVyYWN0aXZlT2JqZWN0JztcbmltcG9ydCBHbG9iYWxzIGZyb20gJy4vR2xvYmFscyc7XG5pbXBvcnQgRHluYW1pY09iamVjdCBmcm9tICcuL0R5bmFtaWNPYmplY3QnO1xuaW1wb3J0IEFuaW1hdGlvbk1vZGUgZnJvbSAnLi9BbmltYXRpb25Nb2RlJztcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9IZWxwZXInO1xuaW1wb3J0IFJvdXRlR3JhcGggZnJvbSAnLi9Sb3V0ZUdyYXBoJztcbmltcG9ydCBSb3V0ZU5vZGUgZnJvbSAnLi9Sb3V0ZU5vZGUnO1xuXG4vLyByZXNvdXJjZSBwYXRoc1xuLy8gY2xhc3Nyb29tXG5jb25zdCBDbGFzc3Jvb21SZW5kZXI6IHN0cmluZyA9XG4gICAgJy9yZXNvdXJjZXMvc2NlbmVzL2NsYXNzcm9vbS9DbGFzc3Jvb21SZW5kZXIucG5nJztcbmNvbnN0IENsYXNzcm9vbUxpZ2h0OiBzdHJpbmcgPVxuICAgICcvcmVzb3VyY2VzL3NjZW5lcy9jbGFzc3Jvb20vQ2xhc3Nyb29tTGlnaHQucG5nJztcblxuLy8gZmVtYWxlIHN0dWRlbnRcbmNvbnN0IEZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdDogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdC1zaGVldC5wbmcnO1xuY29uc3QgRmVtYWxlc3R1ZGVudHdhbGtpbmdub3J0aDogc3RyaW5nID0gJy4uL3Jlc291cmNlcy9jaGFyYWN0ZXJzL2ZlbWFsZV9zdHVkZW50L0ZlbWFsZXN0dWRlbnR3YWxraW5nbm9ydGgtc2hlZXQucG5nJztcbmNvbnN0IEZlbWFsZXN0dWRlbnR3YWxraW5nc291dGg6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoLXNoZWV0LnBuZyc7XG5jb25zdCBGZW1hbGVzdHVkZW50d2Fsa2luZ3dlc3Q6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50d2Fsa2luZ3dlc3Qtc2hlZXQucG5nJztcblxuY29uc3QgRmVtYWxlc3R1ZGVudHNpdHRpbmc6IHN0cmluZyA9ICcuLi9yZXNvdXJjZXMvY2hhcmFjdGVycy9mZW1hbGVfc3R1ZGVudC9GZW1hbGVzdHVkZW50c2l0dGluZy5wbmcnXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xhc3Nyb29tU2NlbmUgaW1wbGVtZW50cyBTY2VuZSB7XG4gICAgLy8gdGhlIHNjZW5lcyBjYW52YXMgbG9jYXRpb25cbiAgICBsZWZ0OiBudW1iZXI7XG4gICAgdG9wOiBudW1iZXI7XG5cbiAgICAvLyB0aGUgc2l6ZSBvZiB0aGUgYWN0dWFsIGF2YWlsYWJsZSBzY3JlZW5cbiAgICBzY3JlZW5XaWR0aDogbnVtYmVyO1xuICAgIHNjcmVlbkhlaWdodDogbnVtYmVyO1xuXG4gICAgLy8gdGhlIGNhbnZhcyBjdHhcbiAgICBzdGF0aWNDdHghOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgZHluYW1pY0N0eCE6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuICAgIHN0YXRpY0NhbnZhcyE6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIGR5bmFtaWNDYW52YXMhOiBIVE1MQ2FudmFzRWxlbWVudDtcblxuICAgIC8vIHRoZSBwaXhlbCBzaXplIG9mIHRoZSBvcmlnaW5hbCBzY2VuZSBhcnRcbiAgICByZWFkb25seSBvcmlnaW5hbFdpZHRoOiBudW1iZXIgPSA2ODQ7XG4gICAgcmVhZG9ubHkgb3JpZ2luYWxIZWlnaHQ6IG51bWJlciA9IDQ1NDtcblxuICAgIC8vIHRoZSBzaXplIG9mIHRoZSBzY2VuZSBhcnQgYWZ0ZXIgc2NhbGluZyBoYXMgYmVlbiBhcHBsaWVkXG4gICAgcmVhbFdpZHRoOiBudW1iZXI7XG4gICAgcmVhbEhlaWdodDogbnVtYmVyO1xuXG4gICAgLy8gdGhlIGZhY3RvciBieSB3aGljaCB0aGUgb3JpZ2luYWwgYXJ0IGhhcyB0byBiZSBzY2FsZWQgdG9cbiAgICAvLyBmaWxsIHRoZSBhdmFpbGFibGUgc2NyZWVuIHNpemUuXG4gICAgc2l6ZUZhY3RvcjogbnVtYmVyO1xuXG4gICAgLy8gYW4gYWRkaXRpb25hbCBzY2FsaW5nIGZhY3RvciwgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICAgIC8vIGFwcGx5IGFkZGl0aW9uYWwgc2NhbGluZ1xuICAgIHpvb21GYWN0b3I6IG51bWJlciA9IDEuMTtcblxuICAgIHBsYXllck9iamVjdCE6IER5bmFtaWNPYmplY3Q7XG4gICAgZHluYW1pY09iamVjdHM6IER5bmFtaWNPYmplY3RbXSA9IFtdO1xuXG4gICAgLy8gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgSW50ZXJhY3RpdmVPYmplY3RzIGluIHRoZSBzY2VuZVxuICAgIGludGVyYWN0aXZlT2JqZWN0czogSW50ZXJhY3RpdmVPYmplY3RbXSA9IFtdO1xuXG4gICAgY2hhaXJab25lczogSW50ZXJhY3RpdmVPYmplY3RbXSA9IFtdO1xuXG4gICAgcm91dGVHcmFwaCE6IFJvdXRlR3JhcGg7XG5cbiAgICBjb25zdHJ1Y3RvcihzY3JlZW5XaWR0aDogbnVtYmVyLCBzY3JlZW5IZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLmxlZnQgPSAwO1xuICAgICAgICB0aGlzLnRvcCA9IDA7XG4gICAgICAgIHRoaXMuc2NyZWVuV2lkdGggPSBzY3JlZW5XaWR0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQgPSBzY3JlZW5IZWlnaHQ7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIGZhY3RvciBieSB3aGljaCBvcmlnaW5hbCBpbWFnZSBoZWlnaHRcbiAgICAgICAgLy8gaXMgc21hbGxlciB0aGFuIHNjcmVlbi5cbiAgICAgICAgdGhpcy5zaXplRmFjdG9yID0gdGhpcy5zY3JlZW5IZWlnaHQgLyB0aGlzLm9yaWdpbmFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIGFkanVzdCBzaXplIHRvIHdpZHRoIGlmIGFkanVzdGluZyBieSBoZWlnaHQgZG9lc24ndCBmaWxsIHNjcmVlbi5cbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxXaWR0aCAqIHRoaXMuc2l6ZUZhY3RvciA8IHRoaXMuc2NyZWVuV2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2l6ZUZhY3RvciA9IHRoaXMuc2NyZWVuV2lkdGggLyB0aGlzLm9yaWdpbmFsV2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNpemVGYWN0b3IgKj0gdGhpcy56b29tRmFjdG9yOyAvLyBhcHBseSB6b29tXG5cbiAgICAgICAgLy8gc2Nyb2xsIHRoZSBjYW1lcmEgdG8gdGhlIGNlbnRlciBvZiB0aGUgc2NlbmVcbiAgICAgICAgY29uc3Qgc2NfeTogbnVtYmVyID0gKHRoaXMub3JpZ2luYWxIZWlnaHQgKlxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZUZhY3RvciAtXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQpIC8gMjtcbiAgICAgICAgY29uc3Qgc2NfeDogbnVtYmVyID0gKHRoaXMub3JpZ2luYWxXaWR0aCAqXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplRmFjdG9yIC1cbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbldpZHRoKSAvIDI7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKHNjX3gsIHNjX3kpO1xuICAgICAgICB9LCAyKTtcblxuICAgICAgICAvLyBhcHBseSBzaXppbmdcbiAgICAgICAgdGhpcy5yZWFsV2lkdGggPSB0aGlzLm9yaWdpbmFsV2lkdGggKiB0aGlzLnNpemVGYWN0b3I7XG4gICAgICAgIHRoaXMucmVhbEhlaWdodCA9IHRoaXMub3JpZ2luYWxIZWlnaHQgKiB0aGlzLnNpemVGYWN0b3I7XG5cbiAgICAgICAgdGhpcy5kZWZTdGF0aWNMYXllcigpO1xuICAgICAgICB0aGlzLmRlZkR5bmFtaWNMYXllcigpO1xuICAgICAgICB0aGlzLmRlZkdhbWVMb2dpYygpO1xuICAgIH1cblxuICAgIHJlc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNjcmVlbldpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBmYWN0b3IgYnkgd2hpY2ggb3JpZ2luYWwgaW1hZ2UgaGVpZ2h0IGlzIHNtYWxsZXIgdGhhbiBzY3JlZW4uXG4gICAgICAgIHRoaXMuc2l6ZUZhY3RvciA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gdGhpcy5vcmlnaW5hbEhlaWdodDtcblxuICAgICAgICAvLyBhZGp1c3Qgc2l6ZSB0byB3aWR0aCBpZiBhZGp1c3RpbmcgYnkgaGVpZ2h0IGRvZXNuJ3QgZmlsbCBzY3JlZW4uXG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsV2lkdGggKiB0aGlzLnNpemVGYWN0b3IgPCB0aGlzLnNjcmVlbldpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLnNpemVGYWN0b3IgPSB0aGlzLnNjcmVlbldpZHRoIC8gdGhpcy5vcmlnaW5hbFdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaXplRmFjdG9yICo9IHRoaXMuem9vbUZhY3RvcjsgLy8gYXBwbHkgem9vbVxuXG4gICAgICAgIC8vIHNjcm9sbCB0aGUgY2FtZXJhIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjZW5lXG4gICAgICAgIGNvbnN0IHNjX3kgPSAodGhpcy5vcmlnaW5hbEhlaWdodCAqIHRoaXMuc2l6ZUZhY3RvciAtIHRoaXMuc2NyZWVuSGVpZ2h0KSAvIDI7XG4gICAgICAgIGNvbnN0IHNjX3ggPSAodGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yIC0gdGhpcy5zY3JlZW5XaWR0aCkgLyAyO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbyhzY194LCBzY195KTtcbiAgICAgICAgfSwgMik7XG5cbiAgICAgICAgLy8gYXBwbHkgc2l6aW5nXG4gICAgICAgIHRoaXMucmVhbFdpZHRoID0gdGhpcy5vcmlnaW5hbFdpZHRoICogdGhpcy5zaXplRmFjdG9yO1xuICAgICAgICB0aGlzLnJlYWxIZWlnaHQgPSB0aGlzLm9yaWdpbmFsSGVpZ2h0ICogdGhpcy5zaXplRmFjdG9yO1xuXG4gICAgICAgIC8vIFRPRE86IHNob3VsZCBwcmVmZXJhYmx5IHVzZSB0aGUgcmVzaXplIG1ldGhvZHMsIGJ1dCB0aGV5IGRvbnQgd29yayBsb2xcbiAgICAgICAgdGhpcy5yZXNpemVTdGF0aWNMYXllcigpO1xuICAgICAgICB0aGlzLnJlc2l6ZUR5bmFtaWNMYXllcigpO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IG1vdXNlUG9zOiBWZWN0b3IgPSB0aGlzLmdldFJlbE1vdXNlUG9zKGV2ZW50KTtcbiAgICAgICAgaWYgKEdsb2JhbHMuREVCVUcpIGNvbnNvbGUubG9nKG1vdXNlUG9zKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNoYWlyWm9uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYWlyID0gdGhpcy5jaGFpclpvbmVzW2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNXaXRoaW5JbnRlcmFjdGl2ZU9iamVjdChtb3VzZVBvcywgY2hhaXIpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2luIGNoYWlyJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHsgLy8gVE9ETzogaWYgc2VydmVyIHNheXMgdGhlIHNlYXQgaXMgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJPYmplY3Quc2V0TW92ZW1lbnRSb3V0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm91dGVHcmFwaC5nZXRSb3V0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllck9iamVjdC5yb3V0ZVBvc2l0aW9uLCB0aGlzLnJvdXRlR3JhcGguZ2V0Q2xvc2VzdE5vZGVUbyhjaGFpci5wb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhayAvLyBubyBuZWVkIHRvIGxvb2sgYXQgdGhlIG90aGVyIGNoYWlyc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlSG92ZXIoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgR2xvYmFscy5zZXRDdXJyZW50TW91c2VQb3ModGhpcy5nZXRSZWxNb3VzZVBvcyhldmVudCkpO1xuICAgIH1cblxuICAgIGdldE1vdXNlUG9zKGV2ZW50OiBNb3VzZUV2ZW50KTogVmVjdG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IoZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0cnVlIGlmIHRoZSAocmVsYXRpdmUpIGNvb3JkaW5hdGVzIGFyZSB3aXRoaW4gdGhlIGdpdmVuIHpvbmUuXG4gICAgaXNXaXRoaW5JbnRlcmFjdGl2ZU9iamVjdChwb3M6IFZlY3RvciwgaU9iajogSW50ZXJhY3RpdmVPYmplY3QpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHBvcy54ID4gaU9iai5wb3NpdGlvbi54ICYmIHBvcy54IDwgaU9iai5wb3NpdGlvbi54ICsgaU9iai53aWR0aCkge1xuICAgICAgICAgICAgaWYgKHBvcy55ID4gaU9iai5wb3NpdGlvbi55ICYmIHBvcy55IDwgaU9iai5wb3NpdGlvbi55ICsgaU9iai5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0UmVsTW91c2VQb3MoZXZlbnQ6IE1vdXNlRXZlbnQpOiBWZWN0b3Ige1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgVmVjdG9yKFxuICAgICAgICAgICAgZXZlbnQub2Zmc2V0WCAvIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgIGV2ZW50Lm9mZnNldFkgLyB0aGlzLnNpemVGYWN0b3JcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHBvc1xuICAgIH1cblxuICAgIGNsZWFyU2NyZWVuKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnN0YXRpY0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgICAgIHRoaXMuZHluYW1pY0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgfVxuXG4gICAgZGVmU3RhdGljTGF5ZXIoKTogdm9pZCB7XG4gICAgICAgIC8vIGdldCBjYW52YXNcbiAgICAgICAgY29uc3Qgc3RhQ2FudmFzOiBIVE1MRWxlbWVudHxudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xheWVyMScpO1xuICAgICAgICBpZihzdGFDYW52YXMpIHRoaXMuc3RhdGljQ2FudmFzID0gc3RhQ2FudmFzIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdGF0aWMgY2FudmFzIGVsZW1lbnQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aDtcbiAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMuaGVpZ2h0ID0gdGhpcy5yZWFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIGdldCBjdHhcbiAgICAgICAgY29uc3QgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR8bnVsbCA9XG4gICAgICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZihjdHgpIHRoaXMuc3RhdGljQ3R4ID0gY3R4IGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3RhdGljIGNvbnRleHQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgLy8gZGlzYWJsZSBzbW9vdGhpbmcgb3V0IHBpeGVsc1xuICAgICAgICB0aGlzLnN0YXRpY0N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZVN0YXRpY0xheWVyKCkge1xuICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy53aWR0aCA9IHRoaXMucmVhbFdpZHRoO1xuICAgICAgICB0aGlzLnN0YXRpY0NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlYWxIZWlnaHQ7XG5cbiAgICAgICAgLy8gdGhlIGN0eCBoYXMgdG8gYmUgZmV0Y2hlZCBhZ2Fpbiwgb3RoZXJ3aXNlIHRoZSBpbWFnZSB3aWxsIGdldCBibHVycnkgZm9yIHNvbWUgcmVhc29uLlxuICAgICAgICAvLyBnZXQgY3R4XG4gICAgICAgIGNvbnN0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfG51bGwgPVxuICAgICAgICAgICAgdGhpcy5zdGF0aWNDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYoY3R4KSB0aGlzLnN0YXRpY0N0eCA9IGN0eCBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN0YXRpYyBjb250ZXh0IHdhcyBudWxsIVwiKVxuXG4gICAgICAgIC8vIGRpc2FibGUgc21vb3RoaW5nIG91dCBwaXhlbHNcbiAgICAgICAgdGhpcy5zdGF0aWNDdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZHJhd1N0YXRpY0xheWVyKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLnN0YXRpY0N0eDtcbiAgICAgICAgY29uc3QgcmVuZGVyID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHJlbmRlci5zcmMgPSBDbGFzc3Jvb21SZW5kZXI7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UocmVuZGVyLCB0aGlzLmxlZnQsIHRoaXMudG9wLCB0aGlzLnJlYWxXaWR0aCwgdGhpcy5yZWFsSGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlZkR5bmFtaWNMYXllcigpOiB2b2lkIHtcbiAgICAgICAgLy8gZ2V0IGNhbnZhc1xuICAgICAgICBjb25zdCBkeW5DYW52YXM6IEhUTUxFbGVtZW50fG51bGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGF5ZXIyJyk7XG4gICAgICAgIGlmKGR5bkNhbnZhcykgdGhpcy5keW5hbWljQ2FudmFzID0gZHluQ2FudmFzIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJEeW5hbWljIGNhbnZhcyBlbGVtZW50IHdhcyBudWxsIVwiKVxuXG4gICAgICAgIHRoaXMuZHluYW1pY0NhbnZhcy53aWR0aCA9IHRoaXMucmVhbFdpZHRoO1xuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMuaGVpZ2h0ID0gdGhpcy5yZWFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyIGludGVyYWN0aW9uIGV2ZW50c1xuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMub25jbGljayA9IHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUhvdmVyKGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBnZXQgY3R4XG4gICAgICAgIGNvbnN0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfG51bGwgPVxuICAgICAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmKGN0eCkgdGhpcy5keW5hbWljQ3R4ID0gY3R4IGFzIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRHluYW1pYyBjb250ZXh0IHdhcyBudWxsIVwiKVxuXG4gICAgICAgIC8vIGRpc2FibGUgc21vb3RoaW5nIG91dCBwaXhlbHNcbiAgICAgICAgdGhpcy5keW5hbWljQ3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplRHluYW1pY0xheWVyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMud2lkdGggPSB0aGlzLnJlYWxXaWR0aDtcbiAgICAgICAgdGhpcy5keW5hbWljQ2FudmFzLmhlaWdodCA9IHRoaXMucmVhbEhlaWdodDtcblxuICAgICAgICAvLyB0aGUgY3R4IGhhcyB0byBiZSBmZXRjaGVkIGFnYWluLCBvdGhlcndpc2UgdGhlIGltYWdlIHdpbGwgZ2V0IGJsdXJyeSBmb3Igc29tZSByZWFzb24uXG4gICAgICAgIC8vIGdldCBjdHhcbiAgICAgICAgY29uc3QgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR8bnVsbCA9XG4gICAgICAgICAgICB0aGlzLmR5bmFtaWNDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYoY3R4KSB0aGlzLmR5bmFtaWNDdHggPSBjdHggYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJEeW5hbWljIGNvbnRleHQgd2FzIG51bGwhXCIpXG5cbiAgICAgICAgLy8gZGlzYWJsZSBzbW9vdGhpbmcgb3V0IHBpeGVsc1xuICAgICAgICB0aGlzLmR5bmFtaWNDdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZHJhd0R5bmFtaWNMYXllcigpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5keW5hbWljQ3R4O1xuXG4gICAgICAgICAvLyB0aGlzIGhhcyB0byBiZSBkb25lIHR3byB0aW1lcyBzbyBpIHBhY2thZ2VkIGl0IGluIGEgZnVuY1xuICAgICAgICBmdW5jdGlvbiBkcmF3RHluT2JqKHNjZW5lOiBTY2VuZSk6IHZvaWQge1xuICAgICAgICAgICAgc2NlbmUuZHluYW1pY09iamVjdHMuc29ydCgoYSwgYikgPT4gKGEucG9zaXRpb24ueSA+IGIucG9zaXRpb24ueSkgPyAxIDogLTEpIC8vIHJlbmRlciBsb3dlciBwb3NpdGlvbnMgaW4gZnJvbnRcbiAgICAgICAgICAgIGZvciAoY29uc3QgZHluT2JqIG9mIHNjZW5lLmR5bmFtaWNPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgZHluT2JqLmRyYXcoY3R4LCBzY2VuZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaWdodCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBsaWdodC5zcmMgPSBDbGFzc3Jvb21MaWdodDtcbiAgICAgICAgZHJhd0R5bk9iaih0aGlzKTtcbiAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb2Z0LWxpZ2h0JztcbiAgICAgICAgY3R4LmRyYXdJbWFnZShsaWdodCwgdGhpcy5sZWZ0LCB0aGlzLnRvcCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc2NyZWVuJztcbiAgICAgICAgY3R4LmRyYXdJbWFnZShsaWdodCwgdGhpcy5sZWZ0LCB0aGlzLnRvcCwgdGhpcy5yZWFsV2lkdGgsIHRoaXMucmVhbEhlaWdodCk7XG4gICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tYXRvcCc7XG4gICAgICAgIGRyYXdEeW5PYmoodGhpcyk7XG5cbiAgICAgICAgaWYgKEdsb2JhbHMuREVCVUcpIHtcbiAgICAgICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICAgICAgICAgICAgLy8gZHJhdyBpbnRlcmFjdGl2ZXNcbiAgICAgICAgICAgIGZvciAoY29uc3QgaU9iaiBvZiB0aGlzLmludGVyYWN0aXZlT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93JztcblxuICAgICAgICAgICAgICAgIC8vIG1hcmsgaG92ZXJlZCBvYmplY3RzIGluIHJlZFxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJNb3VzZVBvczogVmVjdG9yID0gR2xvYmFscy5nZXRDdXJyZW50TW91c2VQb3MoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1dpdGhpbkludGVyYWN0aXZlT2JqZWN0KGN1cnJNb3VzZVBvcyxpT2JqKSlcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG5cbiAgICAgICAgICAgICAgICBjdHgucmVjdChcbiAgICAgICAgICAgICAgICAgICAgaU9iai5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBpT2JqLnBvc2l0aW9uLnkgKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGlPYmoud2lkdGggKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGlPYmouaGVpZ2h0ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRyYXcgcm91dGUgZ3JhcGhcbiAgICAgICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLnJvdXRlR3JhcGgubm9kZXMpIHtcbiAgICAgICAgICAgICAgICAvLyBkcmF3IHBhdGhzIHRvIG5laWdoYnVyc1xuICAgICAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbic7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBuIG9mIG5vZGUubmVpZ2hib3Vycykge1xuICAgICAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8obm9kZS5wb3NpdGlvbi54ICogdGhpcy5zaXplRmFjdG9yLCBub2RlLnBvc2l0aW9uLnkgKiB0aGlzLnNpemVGYWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICBjdHgubGluZVRvKG4ucG9zaXRpb24ueCAqIHRoaXMuc2l6ZUZhY3Rvciwgbi5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGRyYXcgbm9kZXNcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdncmVlbic7XG5cbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgIChub2RlLnBvc2l0aW9uLnggKiB0aGlzLnNpemVGYWN0b3IpIC0gMyAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi55ICogdGhpcy5zaXplRmFjdG9yIC0gMyAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgNiAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgNiAqIHRoaXMuc2l6ZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkcmF3IGR5bmFtaWNzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGR5bk9iaiBvZiB0aGlzLmR5bmFtaWNPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSc7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwOiBWZWN0b3IgPSBkeW5PYmouZ2V0UG9zKCk7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICBwLnggKiB0aGlzLnNpemVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIHAueSAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgMyAqIHRoaXMuc2l6ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgMiAqIHRoaXMuc2l6ZUZhY3Rvcik7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlUm91dGVHcmFwaCgpIHtcbiAgICAgICAgY29uc3Qgbm9kZXM6IFJvdXRlTm9kZVtdID0gW107XG5cbiAgICAgICAgLy8gY3JlYXRlIG5ldyBub2RlIGFuZCBhZGQgdG8gbGlzdFxuICAgICAgICBmdW5jdGlvbiBubih4OiBudW1iZXIsIHk6IG51bWJlcik6IFJvdXRlTm9kZSB7XG4gICAgICAgICAgICBsZXQgbjogUm91dGVOb2RlID0gbmV3IFJvdXRlTm9kZSh4LCB5KTtcbiAgICAgICAgICAgIG5vZGVzLnB1c2gobilcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBib3R0b20gb2Ygc2NyZWVuLCBkb29yIGFuZCBiZWxvdyByb3dzXG4gICAgICAgIGxldCBhdF9kb29yID0gbm4oNDE4LCAyODYpO1xuICAgICAgICBsZXQgYmVsb3dfZmlyc3Rfcm93ID0gbm4oMzU4LCAyODYpO1xuICAgICAgICBhdF9kb29yLmFkZEJpZE5laWdoYm91cihiZWxvd19maXJzdF9yb3cpO1xuXG4gICAgICAgIGxldCBiZWxvd19zZWNfcm93ID0gbm4oMjk0LCAyODYpO1xuICAgICAgICBiZWxvd19maXJzdF9yb3cuYWRkQmlkTmVpZ2hib3VyKGJlbG93X3NlY19yb3cpO1xuXG4gICAgICAgIGxldCBiZWxvd190aHJkX3JvdyA9IG5uKDIzMCwgMjg2KTtcbiAgICAgICAgYmVsb3dfc2VjX3Jvdy5hZGRCaWROZWlnaGJvdXIoYmVsb3dfdGhyZF9yb3cpO1xuXG4gICAgICAgIC8vIGZpcnN0IHJvd1xuICAgICAgICBsZXQgZnJfZmlyc3QgPSBubigzNTgsIDI2Myk7XG4gICAgICAgIGxldCBmcl9zZWMgPSBubigzNTgsIDIzMSk7XG4gICAgICAgIGxldCBmcl90aHJkID0gbm4oMzU4LCAxOTkpO1xuICAgICAgICBsZXQgZnJfZnJ0aCA9IG5uKDM1OCwgMTY3KTtcbiAgICAgICAgYmVsb3dfZmlyc3Rfcm93LmFkZEJpZE5laWdoYm91cihmcl9maXJzdCk7XG4gICAgICAgIGZyX2ZpcnN0LmFkZEJpZE5laWdoYm91cihmcl9zZWMpO1xuICAgICAgICBmcl9zZWMuYWRkQmlkTmVpZ2hib3VyKGZyX3RocmQpO1xuICAgICAgICBmcl90aHJkLmFkZEJpZE5laWdoYm91cihmcl9mcnRoKTtcblxuICAgICAgICAvLyBzZWNvbmQgcm93XG4gICAgICAgIGxldCBzY19maXJzdCA9IG5uKDI5NCwgMjYzKTtcbiAgICAgICAgbGV0IHNjX3NlYyA9IG5uKDI5NCwgMjMxKTtcbiAgICAgICAgbGV0IHNjX3RocmQgPSBubigyOTQsIDE5OSk7XG4gICAgICAgIGxldCBzY19mcnRoID0gbm4oMjk0LCAxNjcpO1xuICAgICAgICBiZWxvd19zZWNfcm93LmFkZEJpZE5laWdoYm91cihzY19maXJzdCk7XG4gICAgICAgIHNjX2ZpcnN0LmFkZEJpZE5laWdoYm91cihzY19zZWMpO1xuICAgICAgICBzY19zZWMuYWRkQmlkTmVpZ2hib3VyKHNjX3RocmQpO1xuICAgICAgICBzY190aHJkLmFkZEJpZE5laWdoYm91cihzY19mcnRoKTtcblxuICAgICAgICAvLyB0aGlyZCByb3dcbiAgICAgICAgbGV0IHRoX2ZpcnN0ID0gbm4oMjMwLCAyNjMpO1xuICAgICAgICBsZXQgdGhfc2VjID0gbm4oMjMwLCAyMzEpO1xuICAgICAgICBsZXQgdGhfdGhyZCA9IG5uKDIzMCwgMTk5KTtcbiAgICAgICAgbGV0IHRoX2ZydGggPSBubigyMzAsIDE2Nyk7XG4gICAgICAgIGJlbG93X3RocmRfcm93LmFkZEJpZE5laWdoYm91cih0aF9maXJzdCk7XG4gICAgICAgIHRoX2ZpcnN0LmFkZEJpZE5laWdoYm91cih0aF9zZWMpO1xuICAgICAgICB0aF9zZWMuYWRkQmlkTmVpZ2hib3VyKHRoX3RocmQpO1xuICAgICAgICB0aF90aHJkLmFkZEJpZE5laWdoYm91cih0aF9mcnRoKTtcblxuICAgICAgICAvLyBhZGQgYWxsIHRoZSBub2RlcyB0byB0aGUgc2NlbmVzIGdyYXBoXG4gICAgICAgIHRoaXMucm91dGVHcmFwaCA9IG5ldyBSb3V0ZUdyYXBoKG5vZGVzKTtcbiAgICB9XG5cbiAgICBjcmVhdGVQbGF5ZXIoKSB7XG4gICAgICAgIC8vIGdldCBzcHJpdGVcbiAgICAgICAgY29uc3QgdXNlckNoYXJhY3RlclNwcml0ZTogSFRNTEltYWdlRWxlbWVudCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB1c2VyQ2hhcmFjdGVyU3ByaXRlLnNyYyA9IEZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdDtcblxuICAgICAgICBjb25zdCB1c2VyQ2hhcmFjdGVyOiBEeW5hbWljT2JqZWN0ID0gbmV3IER5bmFtaWNPYmplY3QoMzIsIDMyLCB1c2VyQ2hhcmFjdGVyU3ByaXRlLCB0aGlzLnJvdXRlR3JhcGgubm9kZXNbMF0pO1xuICAgICAgICB1c2VyQ2hhcmFjdGVyLnNldE1vdmVtZW50U3BlZWQoMzApO1xuICAgICAgICB1c2VyQ2hhcmFjdGVyLmFkZEFuaW1hdGlvbk1vZGUoJ3dhbGtpbmcnLFxuICAgICAgICAgICAgbmV3IEFuaW1hdGlvbk1vZGUoXG4gICAgICAgICAgICAgICAgSGVscGVyLlBhdGhzVG9JbWdzKFtGZW1hbGVzdHVkZW50d2Fsa2luZ25vcnRoLCBGZW1hbGVzdHVkZW50d2Fsa2luZ3dlc3QsIEZlbWFsZXN0dWRlbnR3YWxraW5nc291dGgsIEZlbWFsZXN0dWRlbnR3YWxraW5nZWFzdF0pLFxuICAgICAgICAgICAgICAgIDgsIDUuNVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICB1c2VyQ2hhcmFjdGVyLmFkZEFuaW1hdGlvbk1vZGUoJ2lkbGUnLFxuICAgICAgICAgICAgbmV3IEFuaW1hdGlvbk1vZGUoIC8vIFRPRE86IHB1dCBhY3R1YWwgaWRsZSBhbmltYXRpb25zIGhlcmUgZ29kZGFtblxuICAgICAgICAgICAgICAgIEhlbHBlci5QYXRoc1RvSW1ncyhbRmVtYWxlc3R1ZGVudHdhbGtpbmdub3J0aCwgRmVtYWxlc3R1ZGVudHdhbGtpbmd3ZXN0LCBGZW1hbGVzdHVkZW50d2Fsa2luZ3NvdXRoLCBGZW1hbGVzdHVkZW50d2Fsa2luZ2Vhc3RdKSxcbiAgICAgICAgICAgICAgICA4LCA1LjVcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgdXNlckNoYXJhY3Rlci5hZGRBbmltYXRpb25Nb2RlKCdzaXR0aW5nJyxcbiAgICAgICAgICAgIG5ldyBBbmltYXRpb25Nb2RlKCAvLyBUT0RPOiBtYWtlIGRpcmVjdGlvbmFsIHNpdHRpbmcgYW5pbWF0aW9uc1xuICAgICAgICAgICAgICAgIEhlbHBlci5QYXRoc1RvSW1ncyhbRmVtYWxlc3R1ZGVudHNpdHRpbmcsIEZlbWFsZXN0dWRlbnRzaXR0aW5nLCBGZW1hbGVzdHVkZW50c2l0dGluZywgRmVtYWxlc3R1ZGVudHNpdHRpbmddKSxcbiAgICAgICAgICAgICAgICAxLCAwXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJPYmplY3QgPSB1c2VyQ2hhcmFjdGVyO1xuICAgICAgICB0aGlzLmR5bmFtaWNPYmplY3RzLnB1c2godXNlckNoYXJhY3Rlcik7XG4gICAgfVxuXG4gICAgZGVmR2FtZUxvZ2ljKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNyZWF0ZVJvdXRlR3JhcGgoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVQbGF5ZXIoKTtcbiAgICAgICAgLy8gZGVmaW5lIGNoYWlyIHpvbmVzXG4gICAgICAgIC8vIGZvciBlYWNoIGNoYWlyOiBbdXBwZXItbGVmdF0sIHdpZHRoLCBoZWlnaHRcbiAgICAgICAgY29uc3QgY2hhaXJab25lczogQXJyYXk8W1ZlY3RvciwgbnVtYmVyLCBudW1iZXJdPiA9IFtcbiAgICAgICAgICAgIC8vIGJhY2sgKDN0aCkgcm93XG4gICAgICAgICAgICBbbmV3IFZlY3RvcigyNDYsIDIzNyksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigyNDYsIDIwNCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigyNDYsIDE3NCksIDM0LCAzMF0sXG4gICAgICAgICAgICBbbmV3IFZlY3RvcigyNDYsIDE0MiksIDM0LCAzMF0sXG4gICAgICAgICAgICAvLyAyZCByb3dcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDMxMCwgMjM3KSwgMzQsIDMwXSxcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDMxMCwgMjA0KSwgMzQsIDMwXSxcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDMxMCwgMTc0KSwgMzQsIDMwXSxcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDMxMCwgMTQyKSwgMzQsIDMwXSxcbiAgICAgICAgICAgIC8vIDFzdCByb3dcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDM3NCwgMjM3KSwgMzQsIDMwXSxcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDM3NCwgMjA0KSwgMzQsIDMwXSxcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDM3NCwgMTc0KSwgMzQsIDMwXSxcbiAgICAgICAgICAgIFtuZXcgVmVjdG9yKDM3NCwgMTQyKSwgMzQsIDMwXSxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCB6b25lIG9mIGNoYWlyWm9uZXMpXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aXZlT2JqZWN0cy5wdXNoKFxuICAgICAgICAgICAgICAgIG5ldyBJbnRlcmFjdGl2ZU9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgem9uZVswXSxcbiAgICAgICAgICAgICAgICAgICAgem9uZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgem9uZVsyXSkpO1xuICAgICAgICBmb3IgKGNvbnN0IHpvbmUgb2YgY2hhaXJab25lcylcbiAgICAgICAgICAgIHRoaXMuY2hhaXJab25lcy5wdXNoKFxuICAgICAgICAgICAgICAgIG5ldyBJbnRlcmFjdGl2ZU9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgem9uZVswXSxcbiAgICAgICAgICAgICAgICAgICAgem9uZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgem9uZVsyXSkpO1xuICAgIH1cblxuICAgIHJ1bkdhbWVMb29wKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IG8gb2YgdGhpcy5keW5hbWljT2JqZWN0cykge1xuICAgICAgICAgICAgby5tb3ZlT25Sb3V0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IEFuaW1hdG9yIGZyb20gJy4vQW5pbWF0b3InO1xuaW1wb3J0IEdsb2JhbHMgZnJvbSAnLi9HbG9iYWxzJztcbmltcG9ydCBDbGFzc3Jvb21TY2VuZSBmcm9tICcuL0NsYXNzcm9vbVNjZW5lJztcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBHbG9iYWxzLnNldEFjdGl2ZVNjZW5lKFxuICAgICAgICBuZXcgQ2xhc3Nyb29tU2NlbmUoXG4gICAgICAgICAgICB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgICAgIHdpbmRvdy5pbm5lckhlaWdodCkpO1xuXG4gICAgR2xvYmFscy5zZXRBY3RpdmVBbmltYXRvcihcbiAgICAgICAgbmV3IEFuaW1hdG9yKFxuICAgICAgICAgICAgR2xvYmFscy5nZXRBY3RpdmVTY2VuZSgpKSk7XG4gICAgICAgICAgICBHbG9iYWxzLmdldEFjdGl2ZUFuaW1hdG9yKCkuYW5pbWF0ZSgpO1xufTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICBjb25zdCBhY3RpdmVTY2VuZSA9IEdsb2JhbHMuZ2V0QWN0aXZlU2NlbmUoKTtcbiAgICBpZiAoYWN0aXZlU2NlbmUgIT0gbnVsbCkge1xuICAgICAgICBhY3RpdmVTY2VuZS5yZXNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgfVxufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=