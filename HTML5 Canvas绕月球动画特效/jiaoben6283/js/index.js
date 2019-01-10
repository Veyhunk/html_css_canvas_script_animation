 // Referred to https://github.com/spite/looper/blob/master/loops/25.js

var clock = new THREE.Clock();
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x100A47);
scene.fog = new THREE.Fog(0x100A47, 1, 10000);

var objectGroup = new THREE.Group();

var sphere = void 0;

var map = function map(value, beforeMin, beforeMax, afterMin, afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
};

var getPointByAngle = function getPointByAngle(angle) {
    var x = Math.cos(angle);
    var y = Math.sin(angle);
    return { x: x, y: y };
};

var createCurveGeometry = function createCurveGeometry(origin, radius, angle, length, cylinderRadius) {
    var p = new THREE.Vector3();
    var vertices = [];

    var step = 0.1;

    for (var a = angle, len = angle + length; a < len; a += step) {
        var res = getPointByAngle(a);
        var z = Math.sin(a);
        p.set(radius * res.x, 1.25 * radius * res.y, z);
        p.add(origin);

        vertices.push(p.clone());
    }

    var path = new THREE.CatmullRomCurve3(vertices);
    return new THREE.TubeGeometry(path, 2 * vertices.length, cylinderRadius, 18, false);
};

var values = [];
var curveMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    color: 0xffcc00,
    metalness: 0.1,
    roughness: 0.1,
    side: THREE.DoubleSide });


var whiteMaterial = curveMaterial.clone();
whiteMaterial.color.setHex(0xFF25FF);

var blackMaterial = curveMaterial.clone();
blackMaterial.color.setHex(0x4D1AB1);

var randomInRange = function randomInRange(min, max) {
    return min + Math.random() * (max - min);
};

var createObjectData = function createObjectData(radius, length) {
    var r = 0.5;
    var multiplier = Math.floor(randomInRange(1, 5));
    var origin = new THREE.Vector3(randomInRange(-r, r), randomInRange(-r, r), randomInRange(-r, r));
    var start = randomInRange(0, 2 * Math.PI);
    var cylinderRadius = 0.1 * length;
    var rotation = randomInRange(-0.5, 0.5);
    var material = Math.random() > 0.25 ? Math.random() > 0.5 ? blackMaterial : whiteMaterial : curveMaterial;
    return {
        origin: origin, radius: radius, start: start, length: length, cylinderRadius: cylinderRadius, rotation: rotation, material: material, multiplier: multiplier };

};

var createCurveObjects = function createCurveObjects() {
    for (var i = 0, len = 20; i < len; i++) {
        var radius = randomInRange(4.5, 15);
        var length = randomInRange(Math.PI / 8, Math.PI / 4);
        values.push(createObjectData(radius, length));
    }
    for (var _i = 0, _len = 10; _i < _len; _i++) {
        var _radius = randomInRange(4.5, 5);
        var _length = randomInRange(Math.PI / 4, Math.PI / 2);
        values.push(createObjectData(_radius, _length));
    }

    values.forEach(function (v) {
        var geo = createCurveGeometry(v.origin, v.radius, v.start, v.length, v.cylinderRadius);
        var mesh = new THREE.Mesh(geo, v.material);
        mesh.rotation.y = v.rotation;
        mesh.castShadow = mesh.receiveShadow = true;
        objectGroup.add(mesh);
    });

    scene.add(objectGroup);
};

var createSphere = function createSphere() {
    var geometry = new THREE.SphereBufferGeometry(2.8, 30, 15);
    var material = new THREE.MeshToonMaterial({
        color: 0xFF9F13 });

    sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 0;
    sphere.position.y = 0;
    sphere.position.z = 0;

    scene.add(sphere);
};

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

var light = new THREE.HemisphereLight(0xffffff, 0x333333, 0.5);
scene.add(light);

// Camera
var fov = 45;
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);
camera.position.set(0, 0, 20);
camera.lookAt(objectGroup.position);

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

var render = function render() {
    clock.getDelta();
    var time = clock.elapsedTime;

    var len = objectGroup.children.length;
    for (var i = 0; i < len; i++) {
        var object = objectGroup.children[i];
        var v = values[i];
        if (object.type !== "Mesh") {
            continue;
        }

        var offset = time * v.multiplier * Math.PI / 5;
        object.geometry = createCurveGeometry(v.origin, v.radius, v.start + offset, v.length, v.cylinderRadius);
    }

    var rotationSpeed = time * 0.5;
    objectGroup.rotation.x = rotationSpeed;
    objectGroup.rotation.z = rotationSpeed;

    var scaleVal = map(Math.sin(time * 2.0), -1, 1, 0.8, 1.0);
    sphere.scale.x = scaleVal;
    sphere.scale.y = scaleVal;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

var onResize = function onResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
};

createSphere();
createCurveObjects();
onResize();
render();

window.addEventListener("resize", onResize);