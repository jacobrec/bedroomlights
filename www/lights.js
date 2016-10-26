var ws = new WebSocket("ws://" + window.location.host + "/websocket");
lightOn = false;

ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);
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
    $.ajax({
        type: "POST",
        url: 'http://' + window.location.host + '/auth',
        data: JSON.stringify({
            passwd: "petersucks69"
        }),
        success: function(data) {
            console.log(data);
            localStorage.setItem('tok', data);
            $("#lightbut").prop('disabled', false);
        },
        contentType: "application/json"
    });

    $("#lightbut").click(function() {
        if (lightOn) {
            ws.send(JSON.stringify({
                "type": "off",
                "tok": localStorage.getItem('tok')
            }));
        } else {
            ws.send(JSON.stringify({
                "type": "on",
                "tok": localStorage.getItem('tok')
            }));
        }
    });
});
