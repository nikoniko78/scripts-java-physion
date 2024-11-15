/**
 * Makes a BodyNode act like a self-driving car.
 * 
 * It will try to avoid every other BodyNode in the scene.
 * 
 * Customization is included. It is set in the user data of the BodyNode. Includes:
 * - "foward": Number | Can be ignored. Current acceleration of the BodyNode. Defaults to 0
 * - "lowSpeedTime": Number | Can be ignored. How long the BodyNode has considered itself stationary. Defaults to 0
 * - "rays": Array[Object] | Must be ignored. Inner representation of view rays.
 * - "visualize": Boolean | Toggle visualization of the internal view rays. Defaults to false
 * - "numRays": Number | Amount of view rays. Must reenable script upon changing. Defaults to 12
 * - "regularRayLength": Number | Ray length on the port and starboard sides of the BodyNode. Defaults to 10
 * - "rayLengthDiff": Number | Difference in ray length between foward and stern sides. Defaults to 5
 * - "steerForce": Number | Steering force during reaction with view rays. Decreases with higher ray amount. Defaults to 0.03 * (Amount of rays)
 * - "accelForce": Number | Acceleration force during reaction with view rays. Decreases with higher ray amount. Defaults to 45 * (Amount of rays)
 * - "aroundForce": Number | Steering force when turning 180 degrees. Defaults to 5
 * - "desiredSpeed": Number | Acceleration if nothing is happening. It's "desired acceleration". Defaults to 30
 * - "speedStiffness": Number | How much it wants to stay at it's "desired acceleration". Too extreme values will cause undesired behavior. Defaults to 10
 * - "linearVThreshold": Number | Linear velocity threshold for turning around. Defaults to 2
 * - "angularVThreshold": Number | Angular velocity threshold for turning around. Defaults to 3
 * - "aroundTimeThreshold": Number | Delay before turning around if the BodyNode considers itself stationary, by checking linearVThreshold and angularVThreshold. Defaults to 3
 * 
 * Script written by Aiden Ravenshea.
 */
// Please give credit when you take this script! It took a long time.
class SelfDriver {

    // called when script is applied
    constructor(node) {
        this.node = node;

        if (!this.node.userData.foward) this.node.userData.foward = 0;
        if (!this.node.userData.lowSpeedTime) this.node.userData.lowSpeedTime = 0;
        this.defineViewRays();
        this.scene = undefined;
        this.graphics = undefined;
        this.lineStyle = undefined;
        this.fillStyle1 = undefined;
        this.fillStyle2 = undefined;
    }

    // called every frame update
    update(dt) {
        if (this.scene === undefined) this.scene = this.node.findSceneNode();
        if (this.scene) {
            if (this.graphics === undefined) {
                this.graphics = physion.utils.createGraphics();
                this.scene.layers.foreground.addChild(this.graphics);
                this.lineStyle = physion.utils.createLineStyle(0);
                this.fillStyle1 = physion.utils.createFillStyle(0xFF0000);
                this.fillStyle2 = physion.utils.createFillStyle(0x00FF00);
            }

            // count how many seconds we're stationary
            if (this.node.linearVelocity <= (this.node.userData.linearVThreshold || 2) && Math.abs(this.node.angularVelocity) <= (this.node.userData.angularVThreshold || 3)) this.node.userData.lowSpeedTime += this.scene.timeStep;
            else this.node.userData.lowSpeedTime = 0;

            // turn in a random direction if we're stationary
            if (this.node.userData.lowSpeedTime >= (this.node.userData.aroundTimeThreshold || 3)) {
                this.node.userData.lowSpeedTime = 0;
                let dir = Math.sign(this.node.angularVelocity);
                if (dir === 0) dir = Math.round(Math.random() * 2 - 1);

                this.steer(this.node.angle + 180 * dir, this.node.userData.aroundForce || 5);
            }

            // shorten some variable names and save time on typing stuff
            const desiredSpeed = this.node.userData.desiredSpeed || 30,
                speedStiffness = this.node.userData.speedStiffness || 10,
                foward = this.node.userData.foward * this.scene.timeStep,
                regularRayLength = this.node.userData.regularRayLength || 10,
                rayLengthDiff = this.node.userData.rayLengthDiff || 5,
                visualize = this.node.userData.visualize === undefined ? false : this.node.userData.visualize,
                dir = this.rad(this.node.angle);

            // prefer going at the desired acceleration
            this.accelerate((desiredSpeed - this.node.userData.foward) * speedStiffness);
        
            // move the car in the direction it's pointing at it's current set speed
            this.node.linearVelocityX += Math.cos(dir) * foward;
            this.node.linearVelocityY += Math.sin(dir) * foward;

            // rotate the view rays to match the car's orientation
            const reinitialize = this.node.userData.rays === undefined || this.node.userData.rays.length !== this.numRays;
            if (reinitialize) this.defineViewRays();
            if (!reinitialize) {
                this.graphics.clear();
                for (let i = 0; i < this.numRays; i++) {
                    const ray = this.node.userData.rays[i],
                        length = Math.cos(this.rad(i * (360 / this.numRays))) * rayLengthDiff + regularRayLength,
                        dir = this.rad(i * (360 / this.numRays) + this.node.angle);
            
                    if (visualize) physion.utils.drawStyledCircle(this.graphics, ray.closest.x, ray.closest.y, 0.5, this.lineStyle, ray.closest.x !== ray.x || ray.closest.y !== ray.y ? this.fillStyle1 : this.fillStyle2);
            
                    ray.x = Math.cos(dir) * length + this.node.x;
                    ray.y = Math.sin(dir) * length + this.node.y;
                    ray.closest.x = ray.x;
                    ray.closest.y = ray.y;
                    ray.hit = false;
                }
        
                // calculate ray collision points
                const bodyNodes = this.scene.getFilteredDescendants(physion.BodyNode);
                for (const bodyNode of bodyNodes) {
                    if (bodyNode.id === this.node.id || bodyNode.sensor || !bodyNode.active) continue;
                    this.closestCollisions(bodyNode);
                }

                // act according to collisions
                for (let i = 0; i < this.numRays; i++) {
                    const ray = this.node.userData.rays[i];
                    if (ray.hit) {
                        let angle = i * (360 / this.numRays) + 180,
                            distProportion = Math.sqrt((this.node.x - ray.closest.x) ** 2 + (this.node.y - ray.closest.y) ** 2) / Math.sqrt((this.node.x - ray.x) ** 2 + (this.node.y - ray.y) ** 2);
                
                        if (angle > 180) angle -= 360;
                        angle += this.node.angle;

                        if (Math.abs(this.node.angle - angle) % 180 !== 0) this.steer(angle, (this.node.userData.steerForce || (0.03 * this.numRays)) / this.numRays / distProportion);
                        this.accelerate(Math.cos(this.rad(this.node.angle - angle)) * (this.node.userData.accelForce || (45 * this.numRays)) / this.numRays / distProportion);
                    }
                }
            }
        }
    }

    // find the closest point on a line segment to a point
    closestPoint(x1, y1, x2, y2, x3, y3) {
        const dx = x1 - x2,
            dy = y1 - y2,
            lerped = Math.max(0, Math.min(1, -((x2 - x3) * dx + (y2 - y3) * dy) / (dx ** 2 + dy ** 2)));
        return {x: x2 + lerped * dx, y: y2 + lerped * dy};
    }

    // update closest collisions
    closestCollisions(bodyNode) {
        const edges = [...bodyNode.getTransformedShape().edges],
            regularRayLength = this.node.userData.regularRayLength || 10,
            rayLengthDiff = this.node.userData.rayLengthDiff || 5;
        
        // loop over every edge
        for (let i = 0; i < edges.length; i++) {
            // check if the edge is too far to be considered
            const closest = this.closestPoint(
                edges[i].start.x,
                edges[i].start.y,
                edges[i].end.x,
                edges[i].end.y,
                this.node.x,
                this.node.y
            );

            if (Math.sqrt((this.node.x - closest.x) ** 2 + (this.node.y - closest.y) ** 2) > regularRayLength + rayLengthDiff) continue;

            // loop over every view ray
            for (let j = 0; j < this.numRays; j++) {
                // find the closest collision point for this ray
                const ray = this.node.userData.rays[j];
                try {
                    let collision = this.lineLineIntersection(
                        this.node.x,
                        this.node.y,
                        ray.closest.x,
                        ray.closest.y,
                        edges[i].start.x,
                        edges[i].start.y,
                        edges[i].end.x,
                        edges[i].end.y
                    );

                    ray.closest.x = collision.x;
                    ray.closest.y = collision.y;

                    ray.hit = true;
                } catch (e) {}
            }
        }
    }

    // finds the intersection point between 2 lines
    // collaborated with the internet :)
    lineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        // big chungus with code
        const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1)),
            uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) return {x: x1 + (uA * (x2 - x1)), y: y1 + (uA * (y2 - y1))};
        // interesting programming
        throw new Error('No intersection');
    }

    // define the view rays
    defineViewRays() {
        if (this.node.userData.rays === undefined || this.node.userData.rays.length !== this.numRays) {
            const regularRayLength = this.node.userData.regularRayLength || 10,
                rayLengthDiff = this.node.userData.rayLengthDiff || 5;
            this.numRays = this.node.userData.numRays || 12;
            this.node.userData.rays = [];
            for (let i = 0; i < this.numRays; i++) {
                let length = Math.cos(this.rad(i * (360 / this.numRays))) * rayLengthDiff + regularRayLength,
                    dir = this.rad(i * (360 / this.numRays) + this.node.angle);

                this.node.userData.rays.push({
                    x: Math.cos(dir) * length + this.node.x,
                    y: Math.sin(dir) * length + this.node.y,
                    closest: {x: 0, y: 0},
                    hit: false
                });

                let ray = this.node.userData.rays[i];
                ray.closest.x = ray.x;
                ray.closest.y = ray.y;
            }
        }
    }

    steer(targetAngle, turnForce) { this.node.angularVelocity += (targetAngle - this.node.angle) * turnForce * this.scene.timeStep; } // steer this node towards targetAngle
    accelerate(force) { this.node.userData.foward += force * this.scene.timeStep; } // change the speed of this node
    rad(deg) { return deg * (Math.PI / 180); } // degrees to radians
}
