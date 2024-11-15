/**
 * Makes a BodyNode controllable via WASD and IJKL keys,
 * as if in a top-down shooter game, just without the guns.
 * 
 * Script written by Aiden Ravenshea.
 */
class Start {

    constructor(node) {
        this.node = node instanceof physion.BodyNode ? node : undefined;
        if (!this.node) {
            const message = "ControlIJKL can only be attached to a BodyNode";
            alert(message);
            console.warn(message);
        } else {
            this.accel = 30;
            this.turn = 300;
            this.offset = 0;
            this.scene = undefined;
        }
    }

    update(delta) {
        if (this.node) {
            if (this.scene === undefined) this.scene = this.node.findSceneNode();
            if (this.scene) {
                const km = physion.root.keyboardManager,
                    accel = this.accel * (km.isPressed(16) ? 2 : 1) * this.scene.timeStep,
                    pi = Math.PI,
                    tau = pi * 2,
                    quarterPi = pi / 4,
                    angle = (this.node.angle + this.offset) * (pi / 180);
                let x = 0,
                    y = 0,
                    x2 = 0,
                    y2 = 0;
                
                if (km.isPressed(87)) y++;
                if (km.isPressed(83)) y--;
                if (km.isPressed(65)) x--;
                if (km.isPressed(68)) x++;

                if (km.isPressed(73)) y2++;
                if (km.isPressed(74)) x2--;
                if (km.isPressed(75)) y2--;
                if (km.isPressed(76)) x2++;

                const rotating = x2 !== 0 || y2 !== 0,
                    moving = x !== 0 || y !== 0;
                if (!rotating) {
                    x2 = x;
                    y2 = y;
                }

                const target = moving || rotating ? Math.atan2(y2, x2) : quarterPi * Math.round(angle / quarterPi);
                this.node.angularVelocity += (this.mod(target - this.mod(angle, tau) + pi, tau) - pi) * (this.turn * this.scene.timeStep) - this.node.angularVelocity;
                if (moving) {
                    const movementAngle = Math.atan2(y, x);
                    this.node.linearVelocityX += Math.cos(movementAngle) * accel;
                    this.node.linearVelocityY += Math.sin(movementAngle) * accel;
                }
            }
        }
    }

    mod(a, b) { return ((a % b) + b) % b; }
}
