// Aiden Ravenshia's Script(goes along with ResetPlate)
// Destroyes touching objects
class ResetPlateDestroyer {

	// Initializer
	constructor(node) {
		this.node = node;
		this.destroyQueue = new Set();
	}

	// Main loop
	update(dt) {
		for (let bodyNode of this.destroyQueue) {
			if (bodyNode.alpha > 0) bodyNode.alpha -= 0.1;
			else if (bodyNode.parent) {
				bodyNode.parent.removeChild(bodyNode);
				this.destroyQueue.delete(bodyNode);
			}
		}
	}

	// Contact detection
	onBeginContact(bodyNode, contact) {
		if (contact.IsTouching()) this.destroyQueue.add(bodyNode);
	}
}
