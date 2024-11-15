/**
 * Makes a BodyNode pathfind towards another BodyNode, specified by the text in 'this.scene.findChildByName(x)'
 * 
 * Visualization can be enabled by adding {"visualize": true} to the BodyNode's user data.
 * 
 * Script written by Aiden Ravenshea.
 */
class End {

    constructor(node) {
        this.node = node instanceof physion.BodyNode ? node : undefined;
        if (!this.node) {
            const message = "Enemy can only be attached to a BodyNode";
            alert(message);
            console.warn(message);
        } else {
            this.speed = 30; // Movement speed
            this.turn = 60; // Turning speed
            const bb = this.node.getBoundingRect();
            this.step = Math.max(bb.width, bb.height) * 2; // Multiplier is step factor
            this.range = 48; // View range
            this.refresh = 1; // Refresh rate
            this.node.userData.counter = this.refresh * 2;

            this.scene = undefined;
            this.graphics = undefined;
            this.lineStyle = undefined;
            this.fillStyle = undefined;
            this.prevPath = undefined;
        }
    }

    update(delta) {
        if (this.node && this.node.parent) {
            if (this.scene === undefined) this.scene = this.node.findSceneNode();
            if (this.scene) {
                if (this.graphics === undefined) {
                    this.graphics = physion.utils.createGraphics();
			        this.lineStyle = physion.utils.createLineStyle(0);
			        this.fillStyle = physion.utils.createFillStyle(0x00FF00);
                    this.scene.layers.foreground.addChild(this.graphics);
                }

                const player = this.scene.findChildByName("play");
                if (player !== undefined && player.parent !== undefined) {
                    this.node.userData.counter += this.scene.timeStep;
                    const dx = player.x - this.node.x,
                        dy = player.y - this.node.y,
                        dist = Math.sqrt(dx ** 2 + dy ** 2),
                        inRange = dist <= this.range;
                    if (!inRange) this.prevPath = undefined;
                    const speed = this.speed * this.scene.timeStep,
                        deg2Rad = Math.PI / 180,
                        angle = this.node.angle * deg2Rad,
                        angularVelocity = this.node.angularVelocity * deg2Rad;
                    let difference = this.mod(Math.atan2(dy, dx) - this.mod(angle + angularVelocity, Math.PI * 2) + Math.PI, Math.PI * 2) - Math.PI,
                        movement = Math.cos(difference) * speed,
                        path = this.prevPath;
                    
                    this.refresh = Math.max(0.5, dist * 2 / this.range);
                    if (this.node.userData.counter >= this.refresh) {
                        if (this.graphics !== undefined) this.graphics.clear();
                        this.node.userData.counter -= this.refresh;
                        if (inRange) {
                            path = this.pathfind(this.node, player);
                            this.prevPath = path;
                        }
                    }

                    if (path !== undefined && path.length > 1) {
                        if (this.equals(path[path.length - 1], {x: this.round(this.node.x, this.step), y: this.round(this.node.y, this.step)})) {
                            path.pop();
                            this.prevPath = path;
                        }

                        const way = path[path.length - 1];
                        difference = this.mod(Math.atan2(way.y - this.node.y, way.x - this.node.x) - this.mod(angle + angularVelocity, Math.PI * 2) + Math.PI, Math.PI * 2) - Math.PI;
                        movement = Math.cos(difference) * speed;
                    }

                    if (!inRange) {
                        difference = Math.random() * Math.PI / 2 - Math.PI / 4;
                        movement = Math.cos(difference) * speed / 2;
                    }

                    this.node.angularVelocity += difference * this.turn * this.scene.timeStep;
                    this.node.linearVelocityX += Math.cos(angle) * movement;
                    this.node.linearVelocityY += Math.sin(angle) * movement;
                }
            }
        }
    }

    // MAIN FUNCTION
    pathfind(startNode, endNode) {
        const bodyNodes = this.scene.getFilteredDescendants(physion.BodyNode),
            start = {x: this.round(startNode.x, this.step), y: this.round(startNode.y, this.step), g: 0, h: Infinity, parent: undefined},
            end = {x: this.round(endNode.x, this.step), y: this.round(endNode.y, this.step), g: Infinity, h: 0, parent: undefined},
            open = [],
            closed = [];
        start.h = this.dist(start, end);
        this.add(open, start);
        while (open.length > 0) {
            let current = this.pop(open);
            if (this.equals(current, end)) {
                const path = [];
                while (current.parent !== undefined && !this.equals(current.parent, start)) {
                    current = current.parent;
                    path.push(current);
                    if (this.graphics !== undefined && this.node.userData.visualize) physion.utils.drawStyledCircle(this.graphics, current.x, current.y, 0.5, this.lineStyle, this.fillStyle);
                }

                return path;
            }

            closed.push(current);
            for (let x = -this.step; x <= this.step; x += this.step) {
                for (let y = -this.step; y <= this.step; y += this.step) {
                    if (x === 0 && y === 0) continue;
                    let neighbour = {x: current.x + x, y: current.y + y, g: Infinity, h: Infinity, parent: undefined};
                    if (closed.find(node => this.equals(node, neighbour)) !== undefined) continue;
                    let safe = true;
                    for (const bodyNode of bodyNodes) {
                        if (this.equals(neighbour, end)) break;
                        if (bodyNode.id === startNode.id || bodyNode.id === endNode.id || bodyNode.sensor || !bodyNode.active) continue;
                        const container = bodyNode.container;
                        if (container.geometry.containsPoint(container.localTransform.applyInverse(neighbour))) {
                            safe = false;
                            break;
                        }
                    }

                    if (!safe) continue;
                    const newCost = current.g + this.dist(current, neighbour),
                        openCopy = open.find(node => this.equals(node, neighbour));
                    if (openCopy !== undefined) neighbour = openCopy;
                    if (newCost < neighbour.g || openCopy === undefined) {
                        neighbour.g = newCost;
                        neighbour.h = this.dist(neighbour, end);
                        neighbour.parent = current;
                        if (openCopy === undefined) this.add(open, neighbour);
                    }
                }
            }
        }
    }

    // HEAP FUNCTIONS
    add(heap, node) {
        heap.push(node);
        let i = heap.length - 1,
            j = Math.floor((i - 1) / 2);
        while (j >= 0 && this.f(heap[i]) < this.f(heap[j])) {
            [heap[i], heap[j]] = [heap[j], heap[i]];
            i = j;
            j = Math.floor((i - 1) / 2);
        }
    }

    pop(heap) {
        if (heap.length < 1) return;
        [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1], heap[0]];
        const result = heap.pop();
        let i = 0,
            j = 1,
            k = 2;
        while (i < heap.length) {
            const l = j < heap.length ? this.f(heap[i]) - this.f(heap[j]) : -Infinity,
                r = k < heap.length ? this.f(heap[i]) - this.f(heap[k]) : -Infinity;
            if (l === -Infinity && r === -Infinity) break;
            else if (l > r) {
                [heap[i], heap[j]] = [heap[j], heap[i]];
                i = j;
            } else {
                [heap[i], heap[k]] = [heap[k], heap[i]];
                i = k;
            }

            j = 2 * i + 1;
            k = 2 * i + 2;
        }

        return result;
    }

    // NODE FUNCTIONS
    f(n) { return n.g + n.h; }
    equals(a, b) { return a.x === b.x && a.y === b.y; }
    dist(n0, n1) {
        const x = Math.abs(n0.x - n1.x), y = Math.abs(n0.y - n1.y);
        return Math.min(x, y) * Math.SQRT2 + Math.abs(x - y);
    }

    // MISC FUNCTIONS
    mod(a, b) { return ((a % b) + b) % b; }
    round(n, m) { return m * Math.round(n / m); }
}
