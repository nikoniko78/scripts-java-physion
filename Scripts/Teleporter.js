/**
 * Nodes that collide with a Teleporter will be teleported to
 * 
 * When this script is attached to a Node it will automatically do the following:
 * - Set the Node's bodyType property to "static"
 * - Set the Node's sensor property to true
 */
 class Teleporter {

	constructor(node) {
		this.node = node;
		this.node.bodyType = "static";
		this.node.sensor = true;
		this.exitNode = undefined;
		this.exitNodeId = "null";//Type the ID of the exit node here
		this.teleportQueue = new Set();
	}

	update(delta) {
		if (!this.exitNode && this.exitNodeId) {
			const scene = this.node.findSceneNode();
			this.exitNode = scene.findChildById(this.exitNodeId);
			if (this.exitNode) {
				this.exitNode.active = false;
			}
		}
	
		if (this.exitNode) {
			for (let bodyNode of this.teleportQueue) {
				bodyNode.setPosition(this.exitNode.getPosition());
				this.teleportQueue.delete(bodyNode);
			}	
		}
	}

	onBeginContact(bodyNode, contact) {
		if (contact.IsTouching()) {
			this.teleportQueue.add(bodyNode);
		}
	}
}
