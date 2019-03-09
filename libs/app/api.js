Api = {};

Api.getGame = function(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    };
    xhttp.open("GET", "http://space-mines-api.herokuapp.com/game/" + id, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
}
