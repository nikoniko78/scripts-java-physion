class MoveBall {

    constructor(node) {
        this.node = node;
    }

    update(delta) {

        this.node.angularVelocity = Math.min(Math.max(this.node.angularVelocity, -50), 50);

        const KEYCODE_LEFT = 37;
        const KEYCODE_UP = 38;
        const KEYCODE_RIGHT = 39;

        const km = physion.root.keyboardManager;

        if (km.isPressed(KEYCODE_LEFT)) {
            this.node.angularVelocity += 1;
        }

        if (km.isPressed(KEYCODE_RIGHT)) {
            this.node.angularVelocity += -1;
        }

        if (km.isPressed(KEYCODE_UP)) {
            this.node.linearVelocityY = 3;
        }
    }
}
