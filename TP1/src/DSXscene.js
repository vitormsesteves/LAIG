var deg2rad = Math.PI / 180;

function DSXscene(myInterface) {
  CGFscene.call(this);

  this.interface=myInterface;

}

DSXscene.prototype = Object.create(CGFscene.prototype);
DSXscene.prototype.constructor = DSXscene;

DSXscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.textures = [];
    this.materials = [];
    this.leaves = [];
    this.objects = [];
    this.lightsStatus = [];
    this.viewIndex = 0;

    this.axis = new CGFaxis(this);
};

DSXscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(50, 10, 10), vec3.fromValues(0, 0, 0));
};

/**
 * Sets the default scene appearance based on an material named "default"
 * if it is present in the .lsx scene file
 */
DSXscene.prototype.setDefaultAppearance = function() {
    for (var i = 0; i < this.materials.length; i++) {
        if (this.materials[i].id == "default") {
            this.materials[i].apply();
            break;
        }
    }
};

/**
 * Function called by a {LSXParser} once it is done parsing
 * a scene in .lsx format
 */
DSXscene.prototype.onGraphLoaded = function() {
    // Frustum
    /*this.camera.near = this.graph.config.camera.frustum.near;
    this.camera.far = this.graph.config.camera.frustum.far;*/

    //this.axis = new CGFaxis(this, this.graph.config.camera.reference);

    // Illumination
    var bg_illum = this.graph.config.illumination.global.background;
    this.gl.clearColor(bg_illum.r, bg_illum.g, bg_illum.b, bg_illum.a);

    var ambi_illum = this.graph.config.illumination.global.ambient;
    this.setGlobalAmbientLight(ambi_illum.r, ambi_illum.g, ambi_illum.b, ambi_illum.a);

    // Lights
    this.initGraphLights();

    // Textures
    if (this.graph.config.textures.length > 0)
        this.enableTextures(true);

    var text = this.graph.config.textures;
    for (var i = 0; i < text.length; i++) {
        var aux = new SceneTexture(this, text[i].id, text[i].path, text[i].leng);

        this.textures.push(aux);
    }

    // Materials
    var mat = this.graph.config.materials;
    for (i = 0; i < mat.length; i++) {
        aux = new SceneMaterial(this, mat[i].id);
        aux.setAmbient(mat[i].ambient.r, mat[i].ambient.g, mat[i].ambient.b, mat[i].ambient.a);
        aux.setDiffuse(mat[i].diffuse.r, mat[i].diffuse.g, mat[i].diffuse.b, mat[i].diffuse.a);
        aux.setSpecular(mat[i].specular.r, mat[i].specular.g, mat[i].specular.b, mat[i].specular.a);
        aux.setEmission(mat[i].emission.r, mat[i].emission.g, mat[i].emission.b, mat[i].emission.a);
        aux.setShininess(mat[i].shininess);

        this.materials.push(aux);
    }

    this.updateView();

    // Leaves
    this.initLeaves();

    // Nodes
    this.initNodes();
};

DSXscene.prototype.updateView = function () {
    this.camera = this.graph.config.perspectives[this.viewIndex];
    this.interface.setActiveCamera(this.graph.config.perspectives[this.viewIndex]);

    this.viewIndex = (++this.viewIndex) % this.graph.config.perspectives.length;
};

DSXscene.prototype.display = function() {
    //this.shader.bind();
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.updateProjectionMatrix();
    this.loadIdentity();

    this.applyViewMatrix();

    // If LSX has been loaded
    if (this.graph.config.XML.loaded) {

        this.setDefaultAppearance();

        if (this.axis.length != 0) this.axis.display();

        // Apply initial transformations
        //this.applyInitials();

        // Update lights
        for (var i = 0; i < this.lights.length; i++)
            this.lights[i].update();

        // Draw Objects to scene (nodes with leaves)
        for (i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.draw(this);
        }
    }

    this.updateLights();

    //this.shader.unbind();
};

/**
 * Apply the initial transformations defined in <INITIALS>
 */
/*DSXscene.prototype.applyInitials = function() {
    var inits = this.graph.config.camera;
    var trans = inits.translation;
    var scale = inits.scale;
    var rots = inits.rotations;

    this.translate(trans.x, trans.y, trans.z);
    for (var i = 0; i < rots.length; i++) {
        switch (rots[i].axis) {
            case 'x':
                this.rotate(rots[i].angle * deg2rad, 1, 0, 0);
                break;
            case 'y':
                this.rotate(rots[i].angle * deg2rad, 0, 1, 0);
                break;
            case 'z':
                this.rotate(rots[i].angle * deg2rad, 0, 0, 1);
                break;
        }
    }
    this.scale(scale.sx, scale.sy, scale.sz);
};*/

DSXscene.prototype.initGraphLights = function () {
    var index = 0;


    this.lightsStatus= new Array( this.graph.config.illumination.omniLights.length + this.graph.config.illumination.spotLights.length);

    for (var i = 0; i < this.graph.config.illumination.omniLights.length; i++,index++) {
      var omni = this.graph.config.illumination.omniLights[i];

      this.lights[index].setPosition(omni.location.x, omni.location.y, omni.location.z, omni.location.w);
      this.lights[index].setAmbient(omni.ambient.r, omni.ambient.g, omni.ambient.b, omni.ambient.a);
      this.lights[index].setDiffuse(omni.diffuse.r, omni.diffuse.g, omni.diffuse.b, omni.diffuse.a);
      this.lights[index].setSpecular(omni.specular.r, omni.specular.g, omni.specular.b, omni.specular.a);

      this.lightsStatus[index] = omni.enabled;
      this.interface.addLight("omni",index,omni.id);

      if (omni.enabled)
        this.lights[index].enable();
      else
        this.lights[index].disable();

      this.lights[index].setVisible(true);
      this.lights[index].update();
    }



    for (var i = 0; i < this.graph.config.illumination.spotLights.length; i++,index++) {
      var spot = this.graph.config.illumination.spotLights[i];

      this.lights[index].setPosition(spot.location.x, spot.location.y, spot.location.z, 1);
      this.lights[index].setAmbient(spot.ambient.r, spot.ambient.g, spot.ambient.b, spot.ambient.a);
      this.lights[index].setDiffuse(spot.diffuse.r, spot.diffuse.g, spot.diffuse.b, spot.diffuse.a);
      this.lights[index].setSpecular(spot.specular.r, spot.specular.g, spot.specular.b, spot.specular.a);
      this.lights[index].setSpotExponent(spot.exponent);
      this.lights[index].setSpotDirection(spot.direction.x, spot.direction.y, spot.direction.z);

      this.lightsStatus[index] = spot.enabled;
      this.interface.addLight("spot",index,spot.id);

      if (spot.enabled)
        this.lights[index].enable();
      else
        this.lights[index].disable();

      this.lights[index].setVisible(true);
      this.lights[index].update();
    }



};


DSXscene.prototype.updateLights = function () {

  for (var i = 0; i < this.lightsStatus.length; i++) {
    if(this.lightsStatus[i])
      this.lights[i].enable();
    else
      this.lights[i].disable();
  }

  for (var i = 0; i < this.lights.length; i++)
    this.lights[i].update();

}

/**
 * Adds lights to scene defined in <LIGHTS>
 */
DSXscene.prototype.initLights = function() {
    
  this.lights[0].setPosition(2, 3, 3, 1);
  this.lights[0].setAmbient(0, 0, 0, 1);
  this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
  this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
  this.lights[0].setVisible(true);
  this.lights[0].enable();
  this.lights[0].update();

};

/**
 * Adds leaves (primitives) defined in <LEAVES>
 */
DSXscene.prototype.initLeaves = function() {
for (var i = 0; i < this.graph.config.XML.parsedTree.leaves.length; i++) {
        var leaf = this.graph.config.XML.parsedTree.leaves[i];
        switch (leaf.type) {
            case "rectangle":
                var primitive = new MyQuad(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "cylinder":
                primitive = new MyFullCylinder(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "sphere":
                primitive = new MySphere(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
            case "triangle":
                primitive = new MyTriangle(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
         	case "torus":
                primitive = new MyTorus(this, leaf.args);
                primitive.id = leaf.id;
                this.leaves.push(primitive);
                break;
        }
    }
};

/**
 * @brief Function that parses the graph defined in the <NODES> section.
 *
 * It uses a Depth First Search algorithm to search for the
 * final nodes of the graph (which should be leaves) and creates
 * a {SceneObject} based on the transformations and materials/textures
 * defined in previous nodes and the primitive which the leaf represents
 */
DSXscene.prototype.initNodes = function() {
    var nodes_list = this.graph.config.XML.parsedTree.nodes;

    var root_node = this.graph.findNode(this.graph.config.XML.parsedTree.root_id);
    this.DFS(root_node, root_node.material, root_node.texture, root_node.matrix);
};

DSXscene.prototype.DFS = function(node, currMaterial, currTexture, currMatrix) {
    var nextMat = node.material;
    if (node.material == "null") nextMat = currMaterial;

    var nextTex = node.texture;

    if (node.texture == "null") nextTex = currTexture;
    else if (node.texture == "clear") nextTex = null;

    var nextMatrix = mat4.create();
    mat4.multiply(nextMatrix, currMatrix, node.matrix);

    for (var i = 0; i < node.descendants.length; i++) {
        var nextNode = this.graph.findNode(node.descendants[i]);

        if (nextNode == null) {
            var aux = new SceneObject(node.descendants[i]);
            aux.material = this.getMaterial(nextMat);
            aux.texture = this.getTexture(nextTex);
            aux.matrix = nextMatrix;
            aux.isLeaf = true;
            for (var j = 0; j < this.leaves.length; j++) {
                if (this.leaves[j].id == aux.id) {
                    aux.primitive = this.leaves[j];
                    break;
                }
            }
            this.objects.push(aux);
            continue;
        }

        this.DFS(nextNode, nextMat, nextTex, nextMatrix);
    }
};

/**
 * @returns {SceneMaterial} with the {string} id specified
 */
DSXscene.prototype.getMaterial = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.materials.length; i++)
        if (id == this.materials[i].id) return this.materials[i];

    return null;
};

/**
 * @returns {SceneTexture} with the {string} id specified
 */
DSXscene.prototype.getTexture = function(id) {
    if (id == null) return null;

    for (var i = 0; i < this.textures.length; i++)
        if (id == this.textures[i].id) return this.textures[i];

    return null;
};

/**
 * Called from interface when a button is pressed
 * Switches light on or off
 */
DSXscene.prototype.switchLight = function(id, _switch) {
    for (var i = 0; i < this.lights.length; ++i) {
        if (id == this.lights[i].id) {
            _switch ? this.lights[i].enable() : this.lights[i].disable();
        }
    }
};
