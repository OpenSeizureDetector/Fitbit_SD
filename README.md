fitbit_sd README
================

This repository contains the source code for a prototype seizure detector
that utilises a Fitbit smartwatch (Ionic or Versa).

The function of the watch app is simple - it collects 1 second's worth of 
accelerometer data at 25Hz and one heart rate measurement, then sends
it to the phone app for processing.
The phone app will need to be OpenSeizureDetector V2.6.0 or higher.


Build Instructions
==================

See https://dev.fitbit.com/build/guides/command-line-interface/

To install the fitbit sdk do:
	npm add --dev @fitbit/sdk
	npm add --dev @fitbit/sdk-cli

Change directory to the fitbit_sd directory and do:
	npx fitbit 
to enter the fitbit shell, then do
	build
	install

Testing
=======
The fitbit simulator runs on Linux using Wine - see https://appdb.winehq.org/objectManager.php?sClass=version&iId=36675

BUT the simulator does not return any accelerometer data, and it only returns heart rate data when you adjust the heart rate in the simulator (no data is returned if the set heart rate does not change).   So it is not much use for 'real' testing!
