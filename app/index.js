console.log('OpenSeizureDetector.index.js');


import { me } from "appbit";
import document from "document";
import clock from "clock";
import { battery } from "power";
import { initialiseDataHandler } from "./FitbitSdDataHandler.js";

// Declare global object to store all the required app variables and functions.
var osd = {timeStr: '--:--:--', mHR:-1, bat:-1, compStatus:"compStatus", osdStatus:"osdStatus", mute:false};
osd['sdVersion'] = "0.3.0";   // FIXME - set this from package.json somehow.
osd['sdName'] = "FitbitSD";
osd['timeText'] = document.getElementById("time-text");
osd['hrmData'] = document.getElementById("hrm-data");
osd['batData'] = document.getElementById("bat-data");
osd['osdStatusTxt'] = document.getElementById("osd-status");
osd['compStatusTxt'] = document.getElementById("comp-status");


osd['refreshData'] = function() {
    osd['timeText'].text = osd.timeStr;
    if (osd.mHR==-1)
	osd['hrmData'].text = "-- bpm";
    else
	osd['hrmData'].text = JSON.stringify(osd.mHR) + " bpm";
    osd['batData'].text = osd.bat;
    osd['osdStatusTxt'].text = osd.osdStatus;
    osd['compStatusTxt'].text = osd.compStatus;
}


console.log("Application ID: " + me.applicationId);
console.log("Build ID: " + me.buildId);
console.log("Timeout Enabled: " + me.appTimeoutEnabled);
me.appTimeoutEnabled = false;
console.log("Timeout Enabled: " + me.appTimeoutEnabled);
import { me as device } from "device";
console.log(`Type:             ${device.type}`);
console.log(`Model name:       ${device.modelName}`);
console.log("osd="+JSON.stringify(osd));
console.log("me="+JSON.stringify(me));


initialiseDataHandler(osd);
console.log("osd="+JSON.stringify(osd));
// Start the data handler that collects accelerometer and HR data.
osd.startDataHandler();

// Set a timer to update the display every second
clock.granularity = "seconds";
clock.ontick = (evt) => {
    //console.log("clock.tick() : "+evt.date.toTimeString());
    osd.timeStr = evt.date.toLocaleTimeString().split('.')[0];
    osd.bat = "Bat: "+Math.floor(battery.chargeLevel) + "%";
    osd.refreshData();
}
