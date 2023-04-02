
import { FitbitSdComms } from "./FitbitSdComms.js";
import { Accelerometer } from "accelerometer";
import { BodyPresenceSensor } from "body-presence";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import * as messaging from "messaging";
import { memory } from "system";
import { me as device } from "device";


var initialiseDataHandler = function(osd) {
    console.log("initialiseDataHandler()");
    osd['ANALYSIS_PERIOD'] = 5;
    osd['SAMPLE_PERIOD'] = 1;
    osd['SAMPLE_FREQUENCY'] = 25;
    osd['mSamplesX'] = [];
    osd['mSamplesY'] = [];
    osd['mSamplesZ'] = [];
    osd['nSamp'] = 0;
    osd['mHR'] = 0;
    osd['acc'] = null,
    osd['bps'] = null,
    osd['hrm'] = null,
	osd['osdStatus'] = '...';
	osd['compStatus'] = '...';


    osd.startDataHandler = function() {
	console.log("osd.startDataHandler()");
	osd.acc = new Accelerometer(
	    { frequency: osd.SAMPLE_FREQUENCY,
	      batch: osd.SAMPLE_FREQUENCY * osd.SAMPLE_PERIOD });
	osd.acc.onreading = osd.onAccData;
	osd.acc.onactivate = osd.onAccActivated;
	osd.acc.onerror = osd.onAccError;
	
	osd.bps = new BodyPresenceSensor();
	
	osd.hrm = new HeartRateSensor({ frequency: 1, batch: 1 });
	osd.hrm.onreading = osd.onHrData;
	osd.hrm.onactivate = osd.onHrActivated;
	osd.hrm.onerror = osd.onHrError;
	
	osd.acc.start();
	osd.bps.start();
	osd.hrm.start();

	messaging.peerSocket.onopen = osd.onMsgOpen;
	messaging.peerSocket.onmessage = osd.onMsgReceive;
	messaging.peerSocket.onError = osd.onMsgError;
    };

    // Note - actually returns an object that can be turned into JSON
    // with JSON.stringify.
    osd.getDataJson = function() {
		var i;
		var dataObj = {};
		dataObj['dataType'] = 'raw';
		dataObj['data'] = [];
		for(i=0;i<osd.ANALYSIS_PERIOD*osd.SAMPLE_FREQUENCY;i++) {
			// Calculate vector magnitude of each sample
			var mag = Math.sqrt(
				osd.mSamplesX[i] * osd.mSamplesX[i] +
				osd.mSamplesY[i] * osd.mSamplesY[i] +
				osd.mSamplesZ[i] * osd.mSamplesZ[i]
				)
			// Convert data into milli-g for compatibility with Garmin.
			dataObj['data'].push(
			//Math.abs(Math.floor(osd.mSamplesX[i]*1000/9.81))
			//	+ Math.abs(Math.floor(osd.mSamplesY[i]*1000/9.81))
			//	+ Math.abs(Math.floor(osd.mSamplesZ[i]*1000/9.81))
				Math.floor(mag * 1000/9.81)
			);
		};
		// FIXME - this generated a range exception when run - maybe the JSON string is too big for a message so needs to be split into two?
		//dataObj['data3D'] = [];
		//for(i=0;i<osd.ANALYSIS_PERIOD*osd.SAMPLE_FREQUENCY;i++) {
		// Convert data into milli-g for compatibility with Garmin.
		//dataObj['data3D'].push(Math.floor(osd.mSamplesX[i]*1000/9.81));
		//	dataObj['data3D'].push(Math.floor(osd.mSamplesY[i]*1000/9.81));
		//	dataObj['data3D'].push(Math.floor(osd.mSamplesZ[i]*1000/9.81));
		//};		
		dataObj['HR'] = osd.mHR;
		dataObj['mute'] = osd.mMute;
		//return(JSON.stringify(dataObj));
		return(dataObj);
    };


    // Note - actually returns an object that can be turned into JSON
    // with JSON.stringify.
	// Should be compatible with the data in GarminSD as of 02 April 2022.
    osd.getSettingsJson = function() {
		var i;
		var dataObj = {};
		dataObj['dataType'] = 'settings';
		dataObj['analysisPeriod'] = osd.ANALYSIS_PERIOD;
		dataObj['sampleFreq'] = osd.SAMPLE_FREQUENCY;
		dataObj['battery'] = Math.floor(battery.chargeLevel);
		dataObj['watchPartNo'] = device.modelName;
		dataObj['watchFwVersion'] = device.firmwareVersion;
		dataObj['sdVersion'] = osd.sdVersion;   
		dataObj['sdName'] = osd.sdName;
		dataObj['memUsed'] = memory.js.used;
		dataObj['memTotal'] = memory.js.total;
		return(dataObj);
    };

    /////////////////////////////////////
    // Accelerometer Sensor Callbacks
    /////////////////////////////////////
    osd.onAccActivated = function() {
	console.log("onAccActivated");
    };

    osd.onAccError = function() {
	console.log("onAccError");
    };
    
    osd.onAccData = function() {
	var iStart = osd.nSamp*osd.SAMPLE_PERIOD * osd.SAMPLE_FREQUENCY;

	if (osd.acc.readings.timestamp.length !=
	    osd.SAMPLE_PERIOD * osd.SAMPLE_FREQUENCY) {
	    console.log("onAccData - length wrong???? - expected "+
		       osd.SAMPLE_PERIOD +" * " + osd.SAMPLE_FREQUENCY);
	}
	for (var i=0;i<osd.acc.readings.timestamp.length; i++) {
	    osd.mSamplesX[iStart+i] = osd.acc.readings.x[i];
	    osd.mSamplesY[iStart+i] = osd.acc.readings.y[i];
	    osd.mSamplesZ[iStart+i] = osd.acc.readings.z[i];
	}
	osd.nSamp = osd.nSamp + 1;

	// Send data to the phone once we have collected enough.
	if (osd.nSamp * osd.SAMPLE_PERIOD >= osd.ANALYSIS_PERIOD) {
	    console.log("onAccData - Sending Data to Phone...");
	    osd.sendMessage(osd.getDataJson());
	    osd.nSamp = 0;
	    osd.mSamplesX = [];
	    osd.mSamplesY = [];
	    osd.mSamplesZ = [];
	    osd.mHR = -1;  // so we know it is updating
	}
    };

    ////////////////////////////////
    // Heart Rate Sensor Callbacks
    ////////////////////////////////
    osd.onHrActivated = function() {
	console.log("onHrActivated");
    },

    osd.onHrError = function() {
	console.log("onHrError");
    },

    osd.onHrData = function() {
	if (osd.hrm.readings) {
	    //console.log("HR: "+
	    //		JSON.stringify(osd.hrm.readings.heartRate[0]));
	    osd.mHR = osd.hrm.readings.heartRate[0];
	}
    };
    
    /////////////////////////
    // Messaging Callbacks
    osd.onMsgOpen = function() {
	console.log("onMsgOpen()");
    };

    osd.onMsgError = function(err) {
		console.log("onMsgError: " + err.code + " - " + err.message);
		osd['compStatus'] = err.code + "-" +err.message;
		osd['osdStatus'] = "---";
    };

    osd.onMsgReceive = function(evt) {
		console.log("onMsgReceive()");
		console.log("onMsgReceive - evt="+JSON.stringify(evt));
		if (evt['data']=="sendSettings") {
			console.log("sendSettings response");
			osd.sendMessage(osd.getSettingsJson());
			osd['osdStatus'] = "settings";
		} else if (evt['data']=="ERROR: OSD Comms") {
			osd['osdStatus'] = "ERROR: OSD App";
		} else {
			//osd['osdStatus'] = evt.data;
			osd['osdStatus'] = "OSD App OK";
		}
    };

    osd.sendMessage = function(msgObj) {
		if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
			//console.log("sendMessage - sending message: "+JSON.stringify(msgObj));
			// Send the data to peer as a message
			messaging.peerSocket.send(msgObj);
			osd['compStatus'] = "Companion App OK";
		} else {
			console.log("sendMessage() - ERROR peerSocket not ready - not sending message");
			osd['compStatus'] = "Comp Comms ERROR";
			osd['osdStatus'] = "---";
		}
    };
}

export {initialiseDataHandler};

