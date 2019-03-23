var scene;
var camera;
var flyControls;
var renderer;
var minefield;
var mineMeshes = [];
var difficulty;
var mineCount;
var dimension;
var gameId;
var gameData;
var playerId;
var level;

function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

function createSpotlight() {
    var spotlight = new THREE.SpotLight(0xffffff);
    spotlight.position.set(50, 50, 100);
    spotlight.castShadow = true;
    return spotlight;
}

function createCameraLookingAt(position) {
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(50, 50, 125);
    camera.lookAt(position);

    addFlashlightTo(camera);

    flyControls = new THREE.FlyControls(camera);

    flyControls.movementSpeed = 25;
    flyControls.domElement = document.querySelector("#WebGL-output");
    flyControls.rollSpeed = Math.PI / 24;
    flyControls.autoForward = false;
    flyControls.dragToLook = true;

    return camera;
}

function addFlashlightTo(camera) {
    var flashlight = new THREE.SpotLight(0xffffff,5,100);
    camera.add(flashlight);
    flashlight.position.set(0,0,1);
    flashlight.target = camera;
}

function createRenderer() {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x444444, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    return renderer;
}

var clock = new THREE.Clock();

function renderScene() {
    var delta = clock.getDelta();
    flyControls.update(delta);

    //scene.traverse(function(obj) {
    //    if(obj instanceof THREE.Mesh) {
    //        obj.animate();
    //    }
    //});

    requestAnimationFrame(renderScene);
    renderer.render(scene, camera);
}

function addMinefieldTo(scene) {
    minefield = Pod.createMinefield(gameData.pods);
    for (var key in minefield.pods) {
        var mesh = minefield.pods[key].mesh;
        scene.add(mesh);
        mineMeshes.push(mesh);
    }
}

function removeMinefield(scene) {
    for (var key in minefield.pods) {
        var pod = minefield.pods[key];
        var mesh = scene.getObjectByName(pod.mesh.name);
        mesh.geometry.dispose();
        mesh.material.dispose();
        scene.remove(mesh);
        mesh = undefined;
        pod.mesh = undefined;
        pod.data = undefined;
    }
    mineMeshes = [];
    minefield = undefined;
    //animate();
}

function updateMinefield(podData) {
    for(var i = 0; i < podData.length; ++i) {
        var data = podData[i];
        var key = Pod.getKey(data.x, data.y, data.z);
        var pod = minefield.pods[key];
        pod.data = data;
        Pod.update(pod);
    }

}

function init() {
    playerId = get("playerId");
    getGameData(playerId);
}

function getGameData(playerId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            gameData = JSON.parse(this.responseText);
            gameId = gameData.id;
            level = gameData.level;
            console.log("Game ID=" + gameId);
            startGame();
        }
    };
    xhttp.open("GET", "http://space-mines-api.herokuapp.com/player/" + playerId + "/game", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}

function markPod(podId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var temp = JSON.parse(this.responseText);
            if(temp.level != level) {
                level = temp.level;
                removeMinefield(scene);
                gameData = temp;
                addMinefieldTo(scene);
                //startGame();
            }
            else {
                gameData = temp;
                updateMinefield(gameData.pods);
            }
        }
    };
    xhttp.open("PUT", "http://space-mines-api.herokuapp.com/game/" + gameId + "/pod/" + podId, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}

function revealPod(podId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            gameData = JSON.parse(this.responseText);
            updateMinefield(gameData.pods);
        }
    };
    xhttp.open("PATCH", "http://space-mines-api.herokuapp.com/game/" + gameId + "/pod/" + podId, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}

function startGame() {

    scene = new THREE.Scene();
    addMinefieldTo(scene);
    camera = createCameraLookingAt(Pod.getCenter(minefield));
    renderer = createRenderer();

    var spotlight = createSpotlight();
    var ambientLight = new THREE.AmbientLight(0x505050);

    scene.add(ambientLight);
    scene.add(camera);
    scene.add(spotlight);

    document.onmousedown = onMouseDown;

    document.getElementById("WebGL-output")
        .appendChild(renderer.domElement);

    renderScene(renderer, scene, camera);
}

function onMouseDown(event) {
    var vector = new THREE.Vector3();

    vector.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        -( event.clientY / window.innerHeight ) * 2 + 1,
        0.5);

    vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(mineMeshes);
    var selected;

    for(var i = 0; i < intersects.length; ++i) {
        selected = intersects[i].object;
        if(selected.visible) {
            var pod = Pod.findByMesh(minefield, selected);
            if(event.ctrlKey || event.button != 0) {
                markPod(pod.data.id);
            }
            else {
                revealPod(pod.data.id);
            }
            break;
        }
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onResize, false);
window.onload = init;
