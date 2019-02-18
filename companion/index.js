console.log('COMPANION: Hello world!');
import { me } from "companion";
import * as messaging from "messaging";

var FitbitCompComms = {
    TAG : "FitbitCompComms: ",

    onStart : function() {
	console.log(this.TAG+"onStart()");

	messaging.peerSocket.onopen = this.onOpen;
	messaging.peerSocket.onmessage = this.onReceiveMessage;
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
	    console.log("sendMessage - sending message - "+JSON.stringify(msgObj));
	    // Send the data to peer as a message
	    messaging.peerSocket.send(msgObj);
	} else {
	    console.log("sendMessage() - ERROR peerSocket not read - not sending message");
	}
    },

    // Called when a message is received from the watch - it just sends it
    // to the OSD android app.
    // ....in the most obscure and difficult to read way that I can imagine!
    onReceiveMessage : function(evt) {
	console.log("onReceiveMessage - evt="+JSON.stringify(evt));
	//console.log(" - evt.data="+JSON.stringify(evt.data));
	var url = "http://localhost:8080/data";
	//console.log("Received data - sending it to server");
	// Send the http POST request
	fetch(url,
	      {
		  method: "POST", 
		  headers: {
		      "Content-Type": "application/json",
		  },
		  body: JSON.stringify(evt.data)
	      })
	// Then extract the text from the response
	    .then(response => {
		//console.log("response="+response+", response.status="+response.status);
		return response.text();
	    })
	// Then send the response text back to the watch as a message.
	    .then(responseText => {
		console.log('Success: - responseText = '+responseText);
		FitbitCompComms.sendMessage(responseText);
	    })
	// Catch any errors
	    .catch(function(error) {
		console.log("error="+JSON.stringify(error));
		console.error('Error sending data to server:',
			      error, JSON.stringify(error));
	    }
		  );
	// Clear as mud, eh!
    },
};

FitbitCompComms.onStart();



