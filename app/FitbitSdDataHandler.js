
import { FitbitSdComms } from "./FitbitSdComms.js";
import { Accelerometer } from "accelerometer";
import { BodyPresenceSensor } from "body-presence";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";

var FitbitSdDataHandler = {
    TAG : "FitbitSdDataHandler: ",
    ANALYSIS_PERIOD : 5,
    SAMPLE_PERIOD : 1,
    SAMPLE_FREQUENCY : 25,

    mSamplesX : [],
    mSamplesY : [],
    mSamplesZ : [],
    nSamp : 0,
    mHR : 0,

    mComms : null,
    acc : null,
    bps : null,
    hrm : null,

    initialize : function(appdata) {
	console.log(this.TAG+"initialize()");
	this.appdata = appdata;
	this.mComms = FitbitSdComms;
	this.mComms.onStart(this);
	// 25 Hz, collect 5 seconds of data into a single batch.
	this.acc = new Accelerometer(
	    { frequency: this.SAMPLE_FREQUENCY,
	      batch: this.SAMPLE_FREQUENCY * this.SAMPLE_PERIOD });
	this.acc.onreading = this.onAccData;
	this.acc.onactivate = this.onAccActivated;
	this.acc.onerror = this.onAccError;
	
	this.bps = new BodyPresenceSensor();

	this.hrm = new HeartRateSensor({ frequency: 1, batch: 1 });
	this.hrm.onreading = this.onHrData;
	this.hrm.onactivate = this.onHrActivated;
	this.hrm.onerror = this.onHrError;
	
	this.acc.start();
	this.bps.start();
	this.hrm.start();
	
	console.log("initialize() this; "+JSON.stringify(this));
    
    },

    getDataJson : function() {
	var i;
	var dataObj = {};
	dataObj['dataType'] = 'raw';
	dataObj['data'] = [];
	for(i=0;i<this.ANALYSIS_PERIOD*this.SAMPLE_FREQUENCY;i++) {
	    dataObj['data'].push(
		Math.abs(Math.floor(this.mSamplesX[i]*1000/9.81))
		    + Math.abs(Math.floor(this.mSamplesY[i]*1000/9.81))
		    + Math.abs(Math.floor(this.mSamplesZ[i]*1000/9.81))
	    );
	};
	dataObj['HR'] = this.appdata.hr;
	//return(JSON.stringify(dataObj));
	return(dataObj);
    },

    getSettingsJson : function() {
	var i;
	var dataObj = {};
	dataObj['dataType'] = 'settings';
	dataObj['analysisPeriod'] = this.ANALYSIS_PERIOD;
	dataObj['sampleFreq'] = this.SAMPLE_FREQUENCY;
	dataObj['battery'] = Math.floor(battery.chargeLevel);

	//return(JSON.stringify(dataObj));
	return(dataObj);
    },
    
    /////////////////////////////////////
    // Accelerometer Sensor Callbacks
    /////////////////////////////////////
    onAccActivated : function() {
	console.log("onAccActivated");
    },

    onAccError : function() {
	console.log("onAccError");
    },
    
    onAccData : function() {
	var dh = FitbitSdDataHandler;
	//console.log("onAccData() - num. points="+dh.acc.readings.timestamp.length);
	//console.log("data="+JSON.stringify(dh.acc));
	var iStart = dh.nSamp*dh.SAMPLE_PERIOD * dh.SAMPLE_FREQUENCY;

	if (dh.acc.readings.timestamp.length !=
	    dh.SAMPLE_PERIOD * dh.SAMPLE_FREQUENCY) {
	    console.log("onAccData - length wrong???? - expected "+
		       dh.SAMPLE_PERIOD +" * " + dh.SAMPLE_FREQUENCY);
	}
	for (var i=0;i<dh.acc.readings.timestamp.length; i++) {
	    dh.mSamplesX[iStart+i] = dh.acc.readings.x[i];
	    dh.mSamplesY[iStart+i] = dh.acc.readings.y[i];
	    dh.mSamplesZ[iStart+i] = dh.acc.readings.z[i];
	}
	dh.nSamp = dh.nSamp + 1;

	if (dh.nSamp * dh.SAMPLE_PERIOD == dh.ANALYSIS_PERIOD) {
	    console.log("onAccData - Sending Data to Phone...");
	    dh.mComms.sendMessage(dh.getDataJson());
	    dh.nSamp = 0;
	}
    },

    ////////////////////////////////
    // Heart Rate Sensor Callbacks
    ////////////////////////////////
    onHrActivated : function() {
	console.log("onHrActivated");
    },

    onHrError: function() {
	console.log("onHrError");
    },

    onHrData : function() {
	//console.log("onHrData() this: "+JSON.stringify(FitbitSdDataHandler));
	//console.log("onHrData()"+FitbitSdDataHandler.hrm.timestamp+
	//	    ","+FitbitSdDataHandler.hrm.heartRate);
	var dh = FitbitSdDataHandler;
	if (dh.hrm.readings) {
	    //console.log("HR: "+
	    //		JSON.stringify(dh.hrm.readings.heartRate));
	    dh.appdata.hr = dh.hrm.readings.heartRate[0];
	}
    },

};


export {FitbitSdDataHandler};
