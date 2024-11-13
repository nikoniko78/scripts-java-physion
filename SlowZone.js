//Made by Ben Bell

class SlowZone {

    constructor(node) {
        this.node = node;
        this.node.bodyType = "static";
        this.node.sensor = true;
        this.inContactWith = new Set();
        this.dampingFactor = 0.2;
        this.node.alpha = 0.5;
    }

    update(delta) {
        for (const bodyNode of this.inContactWith) {
            const velocity = bodyNode.getLinearVelocity();
            const dampenedVelocity = {
                x: velocity.x * (1 - this.dampingFactor),
                y: velocity.y * (1 - this.dampingFactor)
            };
            bodyNode.setLinearVelocity(dampenedVelocity);
        }
    }

    onBeginContact(bodyNode, contact) {
        if (contact.IsTouching()) {
            this.inContactWith.add(bodyNode);
        }
    }

    onEndContact(bodyNode, _contact) {
        this.inContactWith.delete(bodyNode);
    }
}
