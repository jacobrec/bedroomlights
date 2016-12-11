var ws = new WebSocket("ws://" + window.location.host + "/websocket");
lightOn = false;

var light = 'lighten-3';
var dark = 'darken-4';

ws.onopen = function(event) {
    ws.send(JSON.stringify({
        "type": 'check',
        "tok": localStorage.getItem('tok')
    }));
};
ws.onmessage = function(evt) {
    var data = JSON.parse(evt.data);
    console.log(evt.data);
    if (data.type == "control") {
        doLights(data.lightstate);
    } else if (data.type == "fan") {
        $(".fanbut").removeClass('teal');
        switch (parseInt(data.fanstate)) {
            case 1:
                $("#fan_low").addClass('teal');
                break;
            case 2:
                $("#fan_mid").addClass('teal');
                break;
            case 3:
                $("#fan_high").addClass('teal');
                break;
            default:
                $("#fan_off").addClass('teal');

        }
    } else if (data.type == "tokenrejected") {
        localStorage.clear();
        $("#passwdbox").show();
        $("#lightbox").hide();
    } else if (data.type == "valid") {
      console.log("Yup, youre in!");
        $("#passwdbox").hide();
        $("#lightbox").show();
        doLights(data.lightstate);
    } else {
        console.error(evt.data);
    }
};

function doLights(lightstate) {
    $("#lightbut").val("controlled");
    if (lightstate == "1") {
        $("#lightbut").removeClass(dark);
        $("#lightbut").addClass(light);
        lightOn = true;
    } else {
        $("#lightbut").removeClass(light);
        $("#lightbut").addClass(dark);
        lightOn = false;
    }
}

$(document).ready(function() {
    $.ajax({
        url: "http://api.forismatic.com/api/1.0/?",
        dataType: "jsonp",
        data: "method=getQuote&format=jsonp&lang=en&jsonp=?",
        success: function(response) {
            $("#quotebox").html("<p id='random_quote' class='flow-text lead text-center'>" +
                response.quoteText + "<br/>&dash; " + response.quoteAuthor + "</p>");
        }
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
                    ws.send(JSON.stringify({
                        "type": 'check',
                        "tok": localStorage.getItem('tok')
                    }));
                },
                contentType: "application/json"
            });
            $("#passwd").val("");
        }

    });

    $(".fanbut").click(function() {
        ws.send(JSON.stringify({
            "type": $(this).attr('id'),
            "tok": localStorage.getItem('tok')
        }));
    });

    $("#signout").click(function() {
        localStorage.clear();
        $("#passwdbox").show();
        $("#lightbox").hide();
        ws.send(JSON.stringify({
            "type": 'signout',
            "tok": localStorage.getItem('tok')
        }));
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
