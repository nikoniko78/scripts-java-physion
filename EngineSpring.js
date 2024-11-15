/**
 * Specialized script, do not use.
 * Makes a SpringNode behave like the spark plug in an engine.
 * 
 * Script written by Aiden Ravenshea.
 */
class EngineSpring {

    constructor(node) {
        this.node = node instanceof physion.SpringNode ? node : undefined;
        if (!this.node) { // Check if node is of wrong type
            const message = "TogglingSpring can only be attached to a SpringNode";
            alert(message);
            console.warn(message);
        } else {
            if (!this.node.userData.activationLength) this.node.userData.activationLength = this.node.length / 2;
            if (!this.node.userData.deactivationLength) this.node.userData.deactivationLength = this.node.length * 2 / 3;
            this.node.userData.k = this.node.k;
            this.node.userData.prevLength = this.length();
            this.node.userData.state = false;
        }
    }

    update(dt) {
        if (this.node) {
            const length = this.length(); // State updating
            if (length >= this.node.userData.activationLength && this.node.userData.prevLength <= this.node.userData.activationLength) this.node.userData.state = true;
            if (length >= this.node.userData.deactivationLength && this.node.userData.prevLength <= this.node.userData.deactivationLength) this.node.userData.state = false;

            if (this.node.userData.state) {
                this.node.lineColor = 0xBB0000;
                this.node.k = this.node.userData.k;
            } else {
                this.node.lineColor = 0x000000;
                this.node.k = 1;
            }

            this.node.userData.prevLength = length;
        }
    }

    // Get true length of spring
    length() {
        const a = this.node.getWorldAnchorA(), b = this.node.getWorldAnchorB();
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
}
