
// Resets an object upon contact
// Script written by Aiden Ravenshea.
class ResetPlate {

    // Initializer
    constructor(node) {
        this.node = node;
        this.scene = undefined;
        this.node.userData.generate = false;
    }

    // Generate linked object
    generate() {
        const bodyNodes = this.scene.getFilteredDescendants(physion.BodyNode);
        for (const bodyNode of bodyNodes) {
            if (bodyNode.id === this.node.id) continue;
            if (bodyNode.userData.linkedId === this.node.id) {
                bodyNode.parent.removeChild(bodyNode);
                break;
            }
        }

        const object = new physion.RectangleNode(1, 1); // Customize object type here
        object.initNode(74, 70, 0); // Customize object spawn state here (x, y, angle)

        // Object properties
        object.fillColor = 0xffffff;
        
        // Track and spawn the object
        object.userData.linkedId = this.node.id;
        this.node.parent.addChild(object);
    }

    // Main loop
    update(dt) {
        if (this.scene === undefined) this.scene = this.node.findSceneNode();
        if (this.scene) {
            if (this.node.userData.generate) this.generate();
            this.node.userData.generate = false;
        }
    }

    // Contact detection
    onBeginContact(bodyNode, contact) {
        if (contact.IsTouching()) this.node.userData.generate = true;
    }
}
