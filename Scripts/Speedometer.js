/**
 * Sets text of a RectangleNode to the speed that it's travelling at in kp/h.
 * 
 * Script written by Aiden Ravenshea.
 */
class Speedometer {

    constructor(node) {
        this.node = node;
        this.correctText();
    }

    update(dt) { this.correctText(); }
    correctText() { this.node.text = `${(this.node.linearVelocity * 3.6).toFixed(1)} kp/h`; }
}
