console.log('OpenSeizureDetector.index.js');


import { me } from "appbit";
import document from "document";
import clock from "clock";
import { battery } from "power";
import { initialiseDataHandler } from "./FitbitSdDataHandler.js";

// Declare global object to store all the required app variables and functions.
var osd = {timeStr: '--:--:--', mHR:-1, bat:-1};

osd['timeText'] = document.getElementById("time-text");
osd['hrmData'] = document.getElementById("hrm-data");
osd['batData'] = document.getElementById("bat-data");


osd['refreshData'] = function() {
    osd['timeText'].text = osd.timeStr;
    if (osd.mHR==-1)
	osd['hrmData'].text = "-- bpm";
    else
	osd['hrmData'].text = JSON.stringify(osd.mHR) + " bpm";
    osd['batData'].text = osd.bat;
}


console.log("Application ID: " + me.applicationId);
console.log("Build ID: " + me.buildId);
console.log("Timeout Enabled: " + me.appTimeoutEnabled);
me.appTimeoutEnabled = false;
console.log("Timeout Enabled: " + me.appTimeoutEnabled);
console.log("osd="+JSON.stringify(osd));

initialiseDataHandler(osd);
console.log("osd="+JSON.stringify(osd));
// Start the data handler that collects accelerometer and HR data.
osd.startDataHandler();

// Set a timer to update the display every second
clock.granularity = "seconds";
clock.ontick = (evt) => {
    //console.log("clock.tick() : "+evt.date.toTimeString());
    osd.timeStr = evt.date.toTimeString().split('.')[0];
    osd.bat = "Bat: "+Math.floor(battery.chargeLevel) + "%";
    osd.refreshData();
}
