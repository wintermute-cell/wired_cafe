import Animator from './Animator';
import Globals from './Globals';
import ClassroomScene from './ClassroomScene';

window.onload = function () {
    Globals.setActiveScene(
        new ClassroomScene(
            window.innerWidth,
            window.innerHeight));

    Globals.setActiveAnimator(
        new Animator(
            Globals.getActiveScene()));
            Globals.getActiveAnimator().animate();
};

window.addEventListener('resize', () => {
    const activeScene = Globals.getActiveScene();
    if (activeScene != null) {
        activeScene.resize(window.innerWidth, window.innerHeight);
    }
});
