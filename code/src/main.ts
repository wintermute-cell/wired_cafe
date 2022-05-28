// resource paths
// classroom
const ClassroomRender: string = '/resources/scenes/classroom/ClassroomRender.png';
const ClassroomLight: string = '/resources/scenes/classroom/ClassroomLight.png';
// female student
const Femalestudentwalkingeast: string = '/resources/characters/female_student/Femalestudentwalkingeast-sheet.png';
const Femalestudentwalkingnorth: string = '/resources/characters/female_student/Femalestudentwalkingnorth-sheet.png';
const Femalestudentwalkingsouth: string = '../resources/characters/female_student/Femalestudentwalkingsouth-sheet.png';
const Femalestudentwalkingwest: string = '../resources/characters/female_student/Femalestudentwalkingwest-sheet.png';

// global constants
const gDEBUG: boolean = true;

// global variables
let gCurrMousePos: object = { x: 0, y: 0 };
let gActiveScene = null;
let gActiveAnimator = null;


// CLASS_BEGIN ClassroomScene
// CLASS_END

window.onload = function () {
  gActiveScene = new ClassroomScene(window.innerWidth, window.innerHeight);
  gActiveAnimator = new Animator(gActiveScene);
  gActiveAnimator.animate();
};

window.addEventListener('resize', () => {
  if (gActiveScene != null) {
    gActiveScene.resize(window.innerWidth, window.innerHeight);
  }
});

// some vector helper functions
function addVectors(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function distVectors(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// an object that can be moved around


