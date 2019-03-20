//{"id":104,"x":0,"y":0,"z":1,"radiation":-1,"flagged":false}

Pod = {radius: 3, spacing: 10};

Pod.create = function (podData) {
    var geometry = new THREE.SphereGeometry(Pod.radius);
    var color = Pod.getColor(podData);
    var material = new THREE.MeshLambertMaterial({color: color});
    var mesh = new THREE.Mesh(geometry, material);
    var pod = {mesh: mesh, data: podData};

    mesh.name = podData.id;
    mesh.position.x = podData.x * Pod.spacing;
    mesh.position.y = podData.y * Pod.spacing;
    mesh.position.z = podData.z * Pod.spacing;
    mesh.castShadow = true;

    return pod;
};

Pod.update = function(pod) {
    var data = pod.data;
    var mesh = pod.mesh;
    if(data.radiation == 0) {
        mesh.visible = false;
    }
    else {
        mesh.visible = true;
        var color = Pod.getColor(data);
        pod.mesh.material = new THREE.MeshLambertMaterial({color: color});
    }
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
    return Pod.findByMesh(minefield, mineMesh);
};

Pod.GRAY = 0x606060;
Pod.GRAY = 0x606060;
Pod.BLUE = 0x0000FF;
Pod.GREEN = 0x00FF00;
Pod.YELLOW = 0xFFFF00;
Pod.ORANGE = 0xFFA500;
Pod.RED = 0xFF0000;
Pod.MARKED = 0xFF00FF;

Pod.getColor = function(podData) {
    if(podData.flagged) {
        return Pod.MARKED;
    }
    var radiation = podData.radiation;
    switch (radiation) {
        case -1:
        case 0: return Pod.GRAY;
        case 1: return Pod.BLUE;
        case 2: return Pod.GREEN;
        case 3: return Pod.YELLOW;
        case 4: return Pod.ORANGE;
        case 5: return Pod.RED;
        default:
            console.log("Radiation of " + " is not valid");
            return Pod.GRAY;
    }
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
        mine.mesh.material = new THREE.MeshLambertMaterial({color: Pod.GRAY});
    }
    else {
        mine.marked = true;
        mine.mesh.material = new THREE.MeshLambertMaterial({color: Pod.MARKED});
    }
};
