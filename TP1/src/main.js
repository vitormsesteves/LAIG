//From https://github.com/EvanHahn/ScriptInclude
include = function() {
    function f() {
        var a = this.readyState;
        (!a || /ded|te/.test(a)) && (c--, !c && e && d());
    }
    var a = arguments,
        b = document,
        c = a.length,
        d = a[c - 1],
        e = d.call;
    e && c--;
    for (var g, h = 0; c > h; h++) g = b.createElement("script"), g.src = arguments[h], g.async = !0, g.onload = g.onerror = g.onreadystatechange = f, (b.head || b.getElementsByTagName("head")[0]).appendChild(g);
};
serialInclude = function(a) {
    var b = console,
        c = serialInclude.l;
    if (a.length > 0) c.splice(0, 0, a);
    else b.log("Done!");
    if (c.length > 0) {
        if (c[0].length > 1) {
            var d = c[0].splice(0, 1);
            b.log("Loading " + d + "...");
            include(d, function() {
                serialInclude([]);
            });
        } else {
            var e = c[0][0];
            c.splice(0, 1);
            e.call();
        };
    } else b.log("Finished.");
};
serialInclude.l = new Array();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

serialInclude(['../lib/CGF.js',
    'lsxparser/LSXIllumination.js',
    'lsxparser/LSXInitials.js',
    'lsxparser/LSXLeaf.js',
    'lsxparser/LSXLight.js',
    'lsxparser/LSXMaterial.js',
    'lsxparser/LSXNode.js',
    'lsxparser/DSXTexture.js',
    'lsxparser/DSXParser.js',

    'primitives/MyCircle.js',
    'primitives/MyCylinder.js',
    'primitives/MyFullCylinder.js',
    'primitives/MyQuad.js',
    'primitives/MyTriangle.js',
    'primitives/MySphere.js',
    'primitives/MyTorus.js',

    'lsxscene/SceneMaterial.js',
    'lsxscene/SceneTexture.js',
    'lsxscene/SceneObject.js',
    'DSXscene.js',
    'Interface.js',

    main = function() {
        var app = new CGFapplication(document.body);
        var myInterface = new Interface();
        var myScene = new DSXscene(myInterface);

        app.init();

        app.setScene(myScene);
        app.setInterface(myInterface);

        myInterface.setActiveCamera(myScene.camera);

        var filename = getUrlVars()['file'] || "scene1/LAIG_TP1_LSX_T01_G11_v1.dsx";

        var myGraph = new DSXParser(filename, myScene);

        app.run();
    }

]);
