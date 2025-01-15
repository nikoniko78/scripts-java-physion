
// Script written by Aiden Ravenshea.
class Animation {

    constructor(node) {
        this.node = node instanceof physion.BodyNode ? node : undefined;
        if (!this.node) {
            const message = "Animation can only be attached to a BodyNode";
            alert(message);
            console.warn(message);
        } else {
            this.scene = undefined;
            this.node.userData.elapsed = 0;
        }
    }

    update(dt) {
        if (this.node) {
            this.node.bodyType = "kinematic";
            if (this.scene === undefined) this.scene = this.node.findSceneNode();
            if (this.scene) {
                const maxSpd = 2 / this.scene.timeStep,
                    maxAngle = Math.PI / 2 * this.scene.timeStep;
                let next = undefined;
                if (this.node.userData.steps) {
                    for (let i = 0; i < this.node.userData.steps.length; i++) {
                        const step = this.node.userData.steps[i];
                        if (step.t >= this.node.userData.elapsed) {
                            next = step;
                            break;
                        }
                    }
                }
                
                if (next) {
                    const time = next.t - this.node.userData.elapsed;
                    if (time <= this.scene.timeStep) {
                        this.node.x = next.x;
                        this.node.y = next.y;
                        this.node.angle = next.a;
                    } else {
                        const dx = next.x - this.node.x,
                            dy = next.y - this.node.y,
                            dist = Math.sqrt(dx ** 2 + dy ** 2),
                            dir = Math.atan2(dy, dx),
                            mx = Math.cos(dir),
                            my = Math.sin(dir),
                            spd = dist / time,
                            angle = (next.a - this.node.angle) / time * (Math.PI / 180),
                            additional = Math.max(0, spd - maxSpd) * this.scene.timeStep,
                            additionalAngle = angle - Math.sign(angle) * Math.max(-maxAngle, Math.min(maxAngle, angle));
                        
                        this.node.linearVelocityX = mx * spd;
                        this.node.linearVelocityY = my * spd;
                        this.node.x += mx * additional;
                        this.node.y += my * additional;
                        this.node.angularVelocity = angle;
                        this.node.angle += additionalAngle * this.scene.timeStep;
                    }
                } else {
                    this.node.x -= this.node.linearVelocityX * this.scene.timeStep;
                    this.node.y -= this.node.linearVelocityY * this.scene.timeStep;
                    this.node.angle -= this.node.angularVelocity * (180 / Math.PI) * this.scene.timeStep;
                    this.node.linearVelocityX = 0;
                    this.node.linearVelocityY = 0;
                    this.node.angularVelocity = 0;
                }

                this.node.userData.elapsed += this.scene.timeStep;
            }
        }
    }
}
