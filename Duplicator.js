
// Script written by Aiden Ravenshea.
class SingleDuplicate {

    constructor(node) {
        this.node = node;
        this.node.sensor = true;

        this.nodes = new Set();
    }

    update(delta) {
        for (let node of this.nodes) {
            if (node.userData.duplicated) continue;
            let clone = node.clone();
            clone.userData.duplicated = true;
            node.userData.duplicated = true;

            node.parent.addChild(clone);
        }

        this.nodes.clear();
    }

    onBeginContact(bodyNode, contact) {
        if (contact.IsTouching()) this.nodes.add(bodyNode);
    }

    onEndContact(bodyNode, contact) {
        if (!contact.IsTouching()) {
            if (bodyNode.userData.duplicated) bodyNode.userData.duplicated = false;
        }
    }
}
