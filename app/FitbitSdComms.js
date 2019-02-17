import * as messaging from "messaging";

var FitbitSdComms = {
    TAG : "FitbitSdComms: ",
    mAccelHandler : null,

    onStart : function(accelHandler) {
	console.log(this.TAG+"onStart()");
	this.mAccelHandler = accelHandler;

	messaging.peerSocket.onopen = this.onOpen;
	messaging.peerSocket.onmessage = this.onReceive;
	messaging.peerSocket.onError = this.onError;
    },

    onOpen : function() {
	console.log("onOpen()");
    },

    onError: function(err) {
	console.log("Connection error: " + err.code + " - " + err.message);
    },

    sendMessage : function(msgObj) {
	if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
	    console.log("sendMessage - sending message: "+JSON.stringify(msgObj));
	    // Send the data to peer as a message
	    messaging.peerSocket.send(msgObj);
	} else {
	    console.log("sendMessage() - ERROR peerSocket not ready - not sending message");
	}
    },

    sendAccelData : function(data) {
	var sdComms = FitbitSdComms;
	console.log("sendAccelData()");
	sdComms.sendMessage(data);
    },

    sendSettings : function() {
	var sdComms = FitbitSdComms;
	console.log("sendSettings()");
	sdComms.sendMessage(sdComms.mAccelHandler.getSettingsJson());
    },

    onReceive : function(evt) {
	console.log("onReceive - evt="+JSON.stringify(evt));
	if (evt['data']=="sendSettings") {
	    console.log("sendSettings response");
	    FitbitSdComms.sendSettings();
	}
    },
};

export {FitbitSdComms};
