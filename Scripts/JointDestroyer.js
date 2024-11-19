/**
 * Makes a BodyNode be able to be phased through, but deletes any joints that touch it.
 * 
 * Script written by Aiden Ravenshea.
 */
class JointDestroyer {

    // Initialize this script.
    constructor(node) {
        this.node = node;
        this.node.sensor = true;
        this.scene = this.node.findSceneNode();
    }

    // Called every frame update.
    update(dt) {
        // Get list of joints in the scene.
        const joints = this.scene.getFilteredDescendants(physion.JointNode).concat(this.scene.getFilteredDescendants(physion.SpringNode));
        for (let joint of joints) {
            // Detect and remove joints that are touching the BodyNode.
            // Why doesn't this.node.container.containsPoint(p) work?!?! It's a built-in function!!!!
            // I had to transform the point locations myself.
            const container = this.node.container,
                geometry = container.geometry,
                transform = container.localTransform;
            if (geometry.containsPoint(transform.applyInverse(joint.getWorldAnchorA())) || geometry.containsPoint(transform.applyInverse(joint.getWorldAnchorB()))) joint.parent.removeChild(joint);
        }
    }
}
