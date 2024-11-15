/**
 * Applies vertical impulses to all bodies that gets in contact with 
 */
class RecursiveCreator {

	constructor(node) {
		this.node = node;
		this.maxRadius = 0.35;
		this.minRadius = 0.025;
		this.scene = undefined;
	}

	update(delta) {
		if (this.scene === undefined) {
			this.scene = this.node.findSceneNode();
		}

		var scene = this.scene;
		if (!scene || scene.childCount > 228) {
			this.node.radius = this.minRadius;
			return;
		}

		if (this.node.radius <= this.maxRadius) {
			this.node.radius += 0.0005;
		} else {
			var childA = this.node.clone();
			var childB = this.node.clone();

			var r = this.minRadius;
			childA.radius = r;
			childB.radius = r;

			var pos = this.node.getScenePosition();
			childA.y = pos.y - r;
			childB.y = pos.y + r;
			childA.scripts = this.node.scripts;
			childB.scripts = this.node.scripts;

			scene.removeChild(this.node);
			scene.addChildren([childA, childB]);	
		}
	}


}
