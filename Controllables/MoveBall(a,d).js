class MoveBall {


   constructor(node) {
       this.node = node;
   }


   update(delta) {


this.node.angularVelocity = Math.min(Math.max(this.node.angularVelocity, -20), 20);






       const KEYCODE_LEFT = 88;
       const KEYCODE_RIGHT = 73;


       const km = physion.root.keyboardManager;


       if (km.isPressed(KEYCODE_LEFT)) {
           this.node.angularVelocity += 1.25;
       }

       if (km.isPressed(KEYCODE_RIGHT)) {
           this.node.angularVelocity += -1.25;
       }
	  
	   this.angularVelocity /= 13
   }
}
