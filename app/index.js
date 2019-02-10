console.log('Hello world!');

import { Accelerometer } from "accelerometer";
import { BodyPresenceSensor } from "body-presence";
import document from "document";
import { HeartRateSensor } from "heart-rate";

// 25 Hz, collect 5 seconds of data into a single batch.
const acc = new Accelerometer({ frequency: 25, batch: 125 });
acc.onreading = onAccData;
acc.onactivate = onAccActivated;
acc.onerror = onAccError;
const bps = new BodyPresenceSensor();
const hrm = new HeartRateSensor({ frequency: 1, batch: 5 });
hrm.onreading = onHrData;
hrm.onactivate = onHrActivated;
hrm.onerror = onHrError;

acc.start();
bps.start();
hrm.start();

const accelData = document.getElementById("accel-data");
const bpsData = document.getElementById("bps-data");
const hrmData = document.getElementById("hrm-data");

function refreshData() {
  const data = {
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
}

function onAccActivated() {
    console.log("onAccActivated");
}

function onAccError() {
    console.log("onAccError");
}
function onAccData(sensor, event) {
    console.log("onAccData()"+sensor+","+event);
    //for (let i=0;i<acc.readings.timestamp.length; i++) {
//	console.log(
//	    'Accelerometer Reading: \
  //      timestamp='+ acc.readings.timestamp[i] + 
    //    acc.readings.x[i] + ',' + acc.readings.y[i] + ',' + acc.readings.z[i]);
    //}
}


function onHrActivated() {
    console.log("onHrActivated");
}

function onHrError() {
    console.log("onHrError");
}
function onHrData() {
    console.log("onHrData()"+hrm.timestamp+","+hrm.heartRate);
    if (hrm.readings) {
	console.log("HR: "+JSON.stringify(hrm.readings.heartRate));
	/*for (let i=0;i<hrm.readings.timestamp.length; i++) {
	    console.log(
		'HR Reading:'+ hrm.readings.timestamp[i] + ':' + hrm.readings.heartRate[i]);
	}
	*/
    }
}

//refreshData();
//setInterval(refreshData, 1000);
