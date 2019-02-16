console.log('COMPANION: Hello world!');
import { me } from "companion";
import * as messaging from "messaging";

var FitbitCompComms = {
    TAG : "FitbitCompComms: ",

    onStart : function() {
	console.log(this.TAG+"onStart()");

	messaging.peerSocket.onopen = this.onOpen;
	messaging.peerSocket.onmessage = this.onReceive;
	messaging.peerSocket.onError = this.onError;
    },

    onOpen : function() {
	console.log("onOpen() - companion ready to receive data.");
    },

    onError: function(err) {
	console.log("Companion Connection error: " + err.code + " - " + err.message);
    },

    sendMessage : function(msgObj) {
	if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
	    console.log("sendMessage - sending message");
	    // Send the data to peer as a message
	    messaging.peerSocket.send(msgObj);
	} else {
	    console.log("sendMessage() - ERROR peerSocket not read - not sending message");
	}
    },

    onReceive : function(evt) {
	console.log("onReceive - evt="+JSON.stringify(evt));
	console.log(" - evt.data="+JSON.stringify(evt.data));
	if (evt.data['dataType'] == 'raw') {
	    var url = "http://localhost:8080/data";
	    console.log("Received data - sending it to server");
	    fetch(url, {
		method: "POST", 
		headers: {
		    "Content-Type": "application/json",
		},
		body: JSON.stringify(evt.data)
	    })
		.then(response => response.json())
		.then(response => console.log('Success:', JSON.stringify(response)))
		.catch(error => console.error('Error sending data to server:', error));
	} else {
	    console.log("Received settings");
	}
    },
};

FitbitCompComms.onStart();



