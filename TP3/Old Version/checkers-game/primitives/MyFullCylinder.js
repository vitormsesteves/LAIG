/**
 * MyFullCylinder
 * @constructor
 */
function MyFullCylinder(scene, args){
	  CGFobject.call(this,scene);
    this.args = args || [1, 1, 1, 8, 8];

    this.height = this.args[0];
    this.botRad = this.args[1];
    this.topRad = this.args[2];
    this.stacks = this.args[3];
	  this.slices = this.args[4];

    this.cylinder = new MyCylinder(scene, this.slices, this.stacks, this.height, this.topRad, this.botRad);
    this.cylinder.initBuffers();

    this.topFace = new MyCircle(scene, this.topRad, this.slices);
 	  this.topFace.initBuffers();

    this.botFace = new MyCircle(scene, this.botRad, this.slices);
 	  this.botFace.initBuffers();
};

MyFullCylinder.prototype = Object.create(CGFobject.prototype);
MyFullCylinder.prototype.constructor = MyFullCylinder;

MyFullCylinder.prototype.display = function()
{
    this.scene.pushMatrix();

    this.scene.translate(0, 0, this.height/2);
    this.scene.scale(1, 1, this.height);

    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.5);
    this.topFace.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0, 0, -0.5);
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.botFace.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
		this.scene.translate(0, 0, -0.5);
    this.cylinder.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
};

MyFullCylinder.prototype.updateTex = function(S, T) {
};
