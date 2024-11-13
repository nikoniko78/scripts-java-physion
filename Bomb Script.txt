
class Bomb {

    constructor(node) {
        this.node = node;
        this.force = this.node.userData.force || 1000;
        this.range = this.node.userData.range || 2048;
        this.selfDestruct = false;
    }

    update(delta) {
	if (this.selfDestruct) this.node.parent.removeChild(this.node);
    }

    onBeginContact(bodyNode, contact) {
        if (contact.IsTouching()) {
            this.explode();
	    this.selfDestruct = true;
        }
    }

    explode() {
        let scene = this.node.findSceneNode();
        let bodyNodes = scene.getFilteredDescendants(physion.BodyNode);

        for (let bodyNode of bodyNodes) {
            if (bodyNode.id === this.node.id) continue;

            let fx = bodyNode.x - this.node.x,
                fy = bodyNode.y - this.node.y,
                dist = Math.sqrt(fx * fx + fy * fy);
            if (dist > this.range) continue;

            let angle = Math.atan2(fy, fx);
            bodyNode.applyLinearImpulse({
                x: Math.cos(angle) * this.force / dist,
                y: Math.sin(angle) * this.force / dist
            });
        }
    }
}
