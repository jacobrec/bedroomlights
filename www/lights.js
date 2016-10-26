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
    $('#passwdbox').leanModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: 1, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
        starting_top: '4%', // Starting top style attribute
        ending_top: '10%', // Ending top style attribute
        ready: function() {
            alert('Ready');
        }, // Callback for Modal open
        complete: function() {
                alert('Closed');
            } // Callback for Modal close
    });
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
                    $("#lightbut").prop('disabled', false);
                },
                contentType: "application/json"
            });
        }

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

    if(localStorage.getItem("tok") == null){
        $("#passwdbox").openModal();
    }
});
