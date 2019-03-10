//{"id":104,"x":0,"y":0,"z":1,"radiation":-1,"flagged":false}

Pod = {radius: 3, spacing: 10};

Pod.create = function (podData) {
    var geometry = new THREE.SphereGeometry(Pod.radius);
    var material = new THREE.MeshLambertMaterial({color: 0xD3D3D3});
    var mesh = new THREE.Mesh(geometry, material);
    var pod = {mesh: mesh, data: podData};

    mesh.position.x = podData.x * Pod.spacing;
    mesh.position.y = podData.y * Pod.spacing;
    mesh.position.z = podData.z * Pod.spacing;
    mesh.castShadow = true;

    return pod;
};

Pod.dataToString = function(pod) {
    return "Pod[id=" + pod.data.id + ",x=" + pod.data.x + ",y=" + pod.data.y + ",z=" + pod.data.z +
        ",radiation=" + pod.data.radiation + ",flagged=" + pod.data.flagged + "]";
};

Pod.createMinefield = function(podData) {
    var podMap = [];
    var minefield = {pods: podMap, gameOver: false};

    for(var i = 0; i < podData.length; ++i) {
        var pod = podData[i];
        var podKey = Pod.getKey(pod.x, pod.y, pod.z);
        podMap[podKey] = Pod.create(pod);
    }

    return minefield;
};

Pod.getCenter = function(minefield) {
    var key = Pod.getKey(1, 1, 1);
    var pod = minefield.pods[key];
    return pod.mesh.position;
};

Pod.getKey = function(x, y, z) {
    return x + "," + y + "," + z;
};

Pod.getMine = function(minefield, x, y, z) {
    var key = Pod.getKey(x, y, z);
    return minefield.pods[key];
};

Pod.findByMesh = function(minefield, mineMesh) {
    var pod;
    for (var key in minefield.pods) {
        if (minefield.pods[key].mesh == mineMesh) {
            pod = minefield.pods[key];
            break;
        }
    }
    return pod;
};

Pod.select = function(minefield, mineMesh) {
    var pod = Pod.findByMesh(minefield, mineMesh);
    alert(Pod.dataToString(pod));
};

Pod.reveal = function(mine) {
    if(mine.isMine) {
        mine.mesh.material = new THREE.MeshBasicMaterial({color: 0xFF0000});
    }
    else if(mine.mineCount == 0) {
        mine.mesh.visible = false;
    }
    else if(mine.mineCount == 1) {
        mine.mesh.material = new THREE.MeshLambertMaterial({color: 0x0000FF});
    }
    else if(mine.mineCount == 2) {
        mine.mesh.material = new THREE.MeshLambertMaterial({color: 0x00FF00});
    }
    else if(mine.mineCount == 3) {
        mine.mesh.material = new THREE.MeshLambertMaterial({color: 0xFFFF00});
    }
    else if(mine.mineCount == 4) {
        mine.mesh.material = new THREE.MeshLambertMaterial({color: 0xFFA500});
    }
    else {
        mine.mesh.material = new THREE.MeshLambertMaterial({color: 0xFF0000});
    }
    mine.revealed = true;
};

Pod.mark = function(minefield, mineMesh) {
    if(minefield.gameOver) return;

    var mine = Pod.findByMesh(minefield, mineMesh);
    if(mine == undefined) {
        console.log("Couldn't find " + mineMesh);
        return;
    }
    if(mine.revealed) {
        return;
    }

    if(mine.marked) {
        mine.marked = false;
        mine.mesh.material = new THREE.MeshLambertMaterial({color: 0xD3D3D3});
    }
    else {
        mine.marked = true;
        mine.mesh.material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    }

    if(Pod.allActiveMinesMarked(minefield)) {
        Pod.win(minefield);
    }
};
