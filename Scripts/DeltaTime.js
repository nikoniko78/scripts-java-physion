
// Script written by Aiden Ravenshea.
class DeltaTime {

    constructor(scene) {
        this.scene = scene instanceof physion.Scene ? scene : undefined;
        if (!this.scene) {
            const message = "DeltaTime can only be attached to a Scene";
            alert(message);
            console.warn(message);
        }
    }

    update(dt) {
        if (this.scene) this.scene.timeStep = dt / 1000;
    }
}
