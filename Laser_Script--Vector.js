class Laser {
    
    constructor (node) {
        this.node = node;

        this.distance = 100;
        this.fade = false;
        this.blur = false;
        this.size = 0.5;
		this.resolution = 100;
		this.laserRelPoint = [3, 0];
		this.on = true;

        this.initialized = false;
        this.graphics = physion.utils.createGraphics();
		this.lineStyle = physion.utils.createLineStyle(0);
		
		this.scene = undefined;
    }

    update(delta) {
		if (this.scene === undefined) {
			this.scene = this.node.findSceneNode();
		}

		if (!this.initialized) {
			this.initialized = true;
			this.fillStyle = physion.utils.createFillStyle(this.node.fillColor);
			const scene = this.node.findSceneNode();
			if (scene) {
				scene.layers.background.addChild(this.graphics);
			}
		}

		if (this.on) {
			/*
			if (this.scene) {
				var thisPos = this.node.getPosition();
				var bodyNodes = this.scene.getFilteredDescendants(physion.BodyNode);
				const laserDistSQ = this.distance ^ 2;
				const hitDistLst = [];
				for (const bodyNode of bodyNodes) {
					if (bodyNode.id === this.node.id) 
					{
						continue;
					}
					var otherPosition = bodyNode.getPosition();
					if (bodyNode instanceof physion.CircleNode)
					{
						var rad = this.node.angle / 180 * Math.PI;
						var farthestPos = { x: Math.cos(rad) * this.distance, y: Math.sin(rad) * this.distance };
						const distsq = this.#calculateDistSq(thisPos, farthestPos, bodyNode.getPosition());
						if (distSq < bodyNode.radius)
						{
							
						}
					}
				}
			}
			*/
			this.#drawBeam();
		}
	}

	#drawBeam() {
		this.graphics.clear();
		var ratio = this.distance / this.resolution;
		var nodepos = this.node.getPosition();
		var rad = this.node.angle / 180 * Math.PI;
		var unitvec = { x: Math.cos(rad), y: Math.sin(rad) };
		
		for (let i = 0; i < this.resolution; i++) {	
			var state = (this.resolution - i) / this.resolution;

			var vert = this.#convert(
				{ x: nodepos.x + unitvec.x * i * ratio, y: nodepos.y + unitvec.y * i * ratio}, 
				ratio, 
				rad
			);

			this.fillStyle.alpha = state;
			physion.utils.drawStyledPolygon(this.graphics, vert, this.lineStyle, this.fillStyle);
		};
	}

	#convert(pos, width, angle) {
		const m = width / 2;
        const n = this.size / 2;
		const veclength = Math.sqrt(m ** 2 + n ** 2);
        return [ 
			this.#rotatevec( { x: m, y: n }, pos, angle, veclength),
			this.#rotatevec( { x: -m, y: n }, pos, angle, veclength),
			this.#rotatevec( { x: -m, y: -n }, pos, angle, veclength),
			this.#rotatevec( { x: m, y: -n }, pos, angle, veclength),
		];
    }

	#rotatevec(vec, center, angle, length) {
		const vecangle = Math.atan2(vec.y, vec.x) + angle;
		const veclength = length || Math.sqrt(vec.x ** 2 + vec.y ** 2);
		return { x: Math.cos(vecangle) * veclength + center.x, y: Math.sin(vecangle) * veclength + center.y}
	}

	#calculateDist (pos1, pos2, point) {
		const up = Math.abs((pos2.x - pos1.x) * (pos1.y - point.y) - (pos1.x - point.x) * (pos2.y - pos1.y));
		const down = Math.sqrt( (pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2 );
		return up / down;
	}

	#calculateDistSq (pos1, pos2, point) {
		const up = ((pos2.x - pos1.x) * (pos1.y - point.y) - (pos1.x - point.x) * (pos2.y - pos1.y)) ** 2;
		const down = (pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2;
		return up / down;
	}
}
