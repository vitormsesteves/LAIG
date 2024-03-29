function MyTerrain(scene, args){
    CGFobject.call(this, scene);
    this.args = args || ["null", "null"];

    this.mat = new CGFappearance(scene);
    this.texture = new CGFtexture(scene, this.args[0]);
    this.heightmap = new CGFtexture(scene, this.args[1]);
    this.mat.setTexture(this.texture);
    this.mat.setTextureWrap('REPEAT', 'REPEAT');

    this.terrainShader = new CGFshader(scene.gl, "shaders/terrain.vert", "shaders/terrain.frag");
    this.terrainShader.setUniformsValues({uSampler2: 1});
    this.terrainShader.setUniformsValues({multiplier: 0.5});

    this.plane = new MyPlane(scene, [100]);
}

MyTerrain.prototype = Object.create(CGFobject.prototype);
MyTerrain.prototype.constructor = MyTerrain;

MyTerrain.prototype.display = function() {

    this.mat.apply();
    this.scene.setActiveShader(this.terrainShader);
    this.heightmap.bind(1);

    this.plane.display();

    this.heightmap.unbind(1);
    this.scene.setActiveShader(this.scene.defaultShader);

};

MyTerrain.prototype.updateTex = function(ampS, ampT){};
