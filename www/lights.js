var ws = new WebSocket("ws://" + window.location.host + "/websocket");
lightOn = false;

ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);
    if (data.type == "control") {
        $("#lightbut").val("controlled");
        if (data.lightstate == "1") {
            //$("#lightbut").text("Turn Off");
            $("#lightbut").toggleClass('darken-4 lighten-2');
            lightOn = true;
        } else {
            //$("#lightbut").text("Turn On");
            $("#lightbut").toggleClass('lighten-2 darken-4');
            lightOn = false;
        }
    } else if (data.type == "tokenrejected") {
        localStorage.clear();
        $("#passwdbox").show();
        $("#lightbox").hide();
    } else {
        console.error(evt.data);
    }

};


$(document).ready(function() {

    $("#sub").click(function() {
        if ($("#passwd").val() != "") {
            $.ajax({
                type: "POST",
                url: 'http://' + window.location.host + '/auth',
                data: JSON.stringify({
                    passwd: $("#passwd").val()
                }),
                success: function(data) {
                    console.log(data);
                    localStorage.setItem('tok', data);
                    $("#passwdbox").hide();
                    $("#lightbox").show();
                },
                contentType: "application/json"
            });
            $("#passwd").val("");
        }

    });
    $("#signout").click(function() {
        localStorage.clear();
        $("#passwdbox").show();
        $("#lightbox").hide();
    });

    $("#lightbut").click(function() {
        console.log("Flip");
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

    if (localStorage.getItem("tok") == null) {
        $("#passwdbox").show();
        $("#lightbox").hide();
    } else {
        $("#passwdbox").hide();
        $("#lightbox").show();
    }
});
