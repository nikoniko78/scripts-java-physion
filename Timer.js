/* / this is the first official script i'm posting, please credit me! Sirfryingpan
*/

class Timer {

	constructor(node) {
		this.node = node;
		this.node.userData.min = 4 /* this will be the amount of minutes you want for the timer, If you want zero secons, subtract this value by one*/
		this.node.userData.sec = 60 /* this will be the amount of seconds you want, if you want zero seconds, set the value to 60 instead of 0 */
		
		this.node.userData.time = 300 /* This value will be the minutes value times 60 plus the seconds value. This is important so the notification will pop up*/
		this.counter = 0;
		this.frequency = 60; /* this will ajust how fast the timer will run, 60 will be 1 sec real time = 1 sec sim time, 30 will be 1 sec real time = 2 sec sim time */		
        this.scene = this.node.findSceneNode();
		
	}

	update(delta) {
		
		if (++this.counter % this.frequency === 0) {
			
				if (this.node.userData.time <= 0){
					
					this.node.text = "0:00"
					alert("Time is up! Press 'OK' to restart the clock!") /* You can change this to say whatever you want*/
					this.node.userData.min = 4
				    this.node.userData.sec = 60
					this.node.userData.time = 300
				} else {

					this.node.userData.sec -= 1
					this.node.userData.time -= 1
			
			if (this.node.userData.sec === -1){
				this.node.userData.min -= 1
				this.node.userData.sec = 59
				
			}
			if (this.node.userData.sec <= 10){
				this.node.text = this.node.userData.min + ":0" + this.node.userData.sec
			}
			if (this.node.userData.sec >= 10){
				this.node.text = this.node.userData.min + ":" + this.node.userData.sec
			}
				}
			
			}

			
			

		
	}
}
