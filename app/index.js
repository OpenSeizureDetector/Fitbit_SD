console.log('OpenSeizureDetector.index.js');

var appdata = { timeStr: '--:--:--', hr:-1, bat:-1};

import { FitbitSdDataHandler } from "./FitbitSdDataHandler.js";

FitbitSdDataHandler.initialize(appdata);

import document from "document";
import clock from "clock";
import { battery } from "power";


const timeText = document.getElementById("time-text");
const accelData = document.getElementById("accel-data");
const bpsData = document.getElementById("bps-data");
const hrmData = document.getElementById("hrm-data");
const batData = document.getElementById("bat-data");


function refreshData() {
    timeText.text = appdata.timeStr;
    hrmData.text = JSON.stringify(appdata.hr) + " bpm";
    batData.text = appdata.bat;
    /*const data = {
	accel: {
	    x: acc.x ? acc.x.toFixed(1) : 0,
	    y: acc.y ? acc.y.toFixed(1) : 0,
	    z: acc.z ? acc.z.toFixed(1) : 0
	},
	bps: {
	    presence: bps.present
	},
	hrm: {
	    heartRate: hrm.heartRate ? hrm.heartRate : 0
	}
    };
    
    accelData.text = JSON.stringify(data.accel);
    bpsData.text = JSON.stringify(data.bps);
    hrmData.text = JSON.stringify(data.hrm);
    */
}


//refreshData();
//setInterval(refreshData, 1000);
clock.granularity = "seconds";
clock.ontick = (evt) => {
    console.log("clock.tick() : "+evt.date.toTimeString());
    appdata.timeStr = evt.date.toTimeString().split('.')[0];
    appdata.bat = Math.floor(battery.chargeLevel) + "%";

    refreshData();
}
