class BetterCube {

    constructor(node) {
        this.node = node;
		    this.inContactWith = new Set();
    }
    
    update(delta) {

      this.node.height = Math.min(Math.max(this.node.height, 0.7), 0.85);
      this.node.width = Math.min(Math.max(this.node.width, 0.7), 0.85);
      this.node.linearVelocityX = Math.min(Math.max(this.node.linearVelocityX, -40), 40);

      this.node.linearVelocityX /= 1.2;

        const KEYCODE_Q = 40;
        const KEYCODE_W = 38;
        const KEYCODE_LEFT = 37;
        const KEYCODE_RIGHT = 39;


     const km = physion.root.keyboardManager;


     if (km.isPressed(KEYCODE_Q)) {
       this.node.width -= 0.05;
       this.node.height -= 0.05;
     } else {
       this.node.width += 0.05;
       this.node.height += 0.05;
     }

     if (km.isPressed(KEYCODE_W)) {
      for (let bodyNode of this.inContactWith) {
			  this.node.linearVelocityY = 6;
      }
		  this.inContactWith.clear();
     } 
     if (km.isPressed(KEYCODE_LEFT)) {
           this.node.linearVelocityX += -2;
       }


       if (km.isPressed(KEYCODE_RIGHT)) {
           this.node.linearVelocityX += 2;
       }
     }
    
    onBeginContact(bodyNode, contact) {
		if (contact.IsTouching()) {
			this.inContactWith.add(bodyNode);
		}
	}
}
