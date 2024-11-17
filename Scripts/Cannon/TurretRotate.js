
// Script re-written by Aiden Ravenshea.
class TurretRotate {

    constructor(node) {
        this.node = node;
		const scene = this.node.findSceneNode();

        this.player = scene.findChildByName("Player");
        this.rangeOfSight = 40; // Took this from the ring around the turret
        this.angleOffset = 0;   // Compensate for the turret looking some random direction at 0 degrees rotation
    }

    update(delta) {

        /*
            Pythagorean Theorem.
            Learned in junior high school.

            a^2 + b^2 = c^2
            c = √(a^2 + b^2)
            
            Now if you make A the distance on the X axis,
            and B the distance on the Y axis, or vice versa,
            C will be the actual distance!

            How will this help?
            Just check if C is smaller than a certain number.
            If it is, rotate the turret towards the player!
            Voila! Limited range of sight!
        */
        let distX = this.player.x - this.node.x,
            distY = this.player.y - this.node.y,
            dist = Math.sqrt(distX ** 2 + distY ** 2);
        
        /*
            Arctangent with 2 inputs.
            Returns the angle towards the specified point from the origin point.

            And inputting atan2(y, x),
            where Y is the distance on the Y axis,
            and X is the distance on the X axis,
            returns the angle towards the specified point (this.player.x)
            from another point (this.node.x)

            Note: Flipping the values of both distX and distY will rotate the angle 180 degrees.
            Meaning it returns the angle from the specified point to the other point.
            Also, we need to convert the output to degrees. Math.atan2 returns the angle in radians.
                                                    v   Conversion   v
        */
        let angleToPlayer = Math.atan2(distY, distX) * (180 / Math.PI);

        // Compensate for turret rotation of 180 degrees and above or -180 and below,
        // since atan2 returns an angle between -PI and PI radians (-180 and 180 degrees)
        if (angleToPlayer + 180 < this.node.angle) {
            while (angleToPlayer + 180 < this.node.angle) angleToPlayer += 360;
        } else if (angleToPlayer - 180 > this.node.angle) {
            while (angleToPlayer - 180 > this.node.angle) angleToPlayer -= 360;
        }

        // If the distance is smaller than the radius, rotate the turret
        // towards the player!
        if (dist < this.rangeOfSight) {
            this.node.angle = angleToPlayer + this.angleOffset;
        }
    }
}
