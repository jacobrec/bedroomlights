var ws = new WebSocket("ws://" + window.location.host + "/websocket");
lightOn = false;

ws.onmessage = function(evt) {
    console.log(evt.data);
    var data = JSON.parse(evt.data);
    console.log(data);
    if (data.type == "control") {
        $("#lightbut").val("controlled");
        if (data.lightstate == "1") {
            $("#lightbut").val("Turn Off");
            lightOn = true;
        } else {
            $("#lightbut").val("Turn On");
            lightOn = false;
        }
    } else if (data.type == "validate") {

    } else {

    }

};




$(document).ready(function() {
    if (localStorage.getItem("name") === null) {

    } else {

    }

    $("#lightbut").click(function() {
        if (lightOn) {
            ws.send(JSON.stringify({
                "type": "off",
            }));
        } else {
            ws.send(JSON.stringify({
                "type": "on",
            }));
        }
    });
});
