function SceneObject(id) {
    this.id = id;
    this.material = null;
    this.texture = null;
    this.matrix = null;
    this.primitive = null;
    this.anims = [];
    this.currAnim = 0;
}

SceneObject.prototype.updateTex = function() {
    this.material.setTexture(this.texture);

    if (this.texture == null) return;

    this.primitive.updateTex(this.texture.leng.s, this.texture.leng.t);
};

SceneObject.prototype.draw = function(scene) {
    scene.pushMatrix();
    this.updateTex();
    this.material.apply();

     // Animation transformations
    if (this.currAnim < this.anims.length) {
        scene.multMatrix(this.anims[this.currAnim].matrix);
    }

    scene.multMatrix(this.matrix);

    this.primitive.display();
    scene.popMatrix();
};

SceneObject.prototype.updateAnims = function(delta) {

    if (this.anims.length == 0 || this.currAnim >= this.anims.length) 
        return;

    if (this.anims[this.currAnim].done) 
        ++this.currAnim;

    if(this.currAnim < this.anims.length) 
        this.anims[this.currAnim].update(delta);
};
