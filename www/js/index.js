/*
*   Author: znu16qvu, 100170451, Lukasz Zbozen
*
*   Description: Javascript to run functions across the whole mobile app.
*   
*   Version: 1.0
*/


// Detect if the device is loaded and running...
document.addEventListener("deviceready", onDeviceReady, false);

// Global variable for unique device ID
var uniqueDeviceID;

function onDeviceReady() {
    
    console.log("Mobile device running...");

    

    // Assign a unique string to each and new device that uses the app
    // Android: Returns a random 64-bit integer
    //          The integer is generated on the device's first boot
    uniqueDeviceID = device.uuid;

    

    document.getElementById('deviceIdManual').value=uniqueDeviceID;
    document.getElementById('deviceIdReport').value=uniqueDeviceID;

    invokeDatabase.createDatabase();
  
    
    // When user releases finger from the selected option - ("touchend"), run qrCodeScanner function.
    document.querySelector("#qrCodeScanner").addEventListener("touchend", qrCodeScanner, false);
    
}



// Function to execute the QR code scanner on mobile camera.
function qrCodeScanner(){
    cordova.plugins.barcodeScanner.scan(
        
        function(result){
            /* After QR code is detected store in each of the input field (readonly)
            *  User might want to use another seat, offer option to rescan before submitting seat data into DB.
            */
            var input = result.text;
            
            // Separate each line in QR code (TEXT) by comma seatID, moduleCode, location
            var fields = input.split(',');
            
            // Each field from the QR scan placed into a input field and assigned to variable.
            var seatId = fields[0];

            var locationCheck = fields[1];
            
            
            // Obtain data from QR code and Output from QR code to be shown in the input field
            $('#qrDeviceId').val(uniqueDeviceID);
            $('#qrseatId').val(seatId);
            $('#qrLocation').val(locationCheck);

            // Output details to the user of scanned QR code
            document.getElementById("yourDeviceId").innerHTML = "Device ID: " + uniqueDeviceID;
            document.getElementById("seatData").innerHTML = "Seat number: " + seatId;
            document.getElementById("locationData").innerHTML = "Location: " + locationCheck;
            /*           
            * User can scan again or submit to database by calling addQRCheckIn function.
            */
            if (seatId != "" && locationCheck != "") {

                //tracingQueries.storeContact(uniqueDeviceID ,seatId, locationCheck);

                document.getElementById("qrCheckin").style.display="block";
                
                document.getElementById("indexPage").style.display="none"; 
                
            }
        // When the QR code is recognised, open allocated URL.
        // cordova.InAppBrowser.open(result.text, '_blank', 'location=yes')

    },function(error){
        // Error message output
        alert(error);

    },
    // QR code settings
        {
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        prompt : "Aim your camera at the QR code!", // Android
        resultDisplayDuration: 1000, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
        disableSuccessBeep: true // iOS and Android
        }
    );
}




// When QR scan is submitted to a input field, confirm to store in database or scan again
function addQRCheckIn() {

    var qrDeviceId = $('#qrDeviceId').val();
    var qrSeat = $('#qrseatId').val();
    var qrlocationSession = $('#qrLocation').val();

    if (qrSeat == "" && qrDeviceId == "" &&  qrlocationSession == "") { 
        swal({
            title: "You must scan a QR code!",
            text: "Please try again or use manual check-in!",
            icon: "warning",
            button: "Confirm",
            });
    } else {
        tracingQueries.storeContact(qrDeviceId ,qrSeat, qrlocationSession);

        swal({
            title: "You have checked in successfully!",
            text: "Press the button to proceed",
            icon: "success",
            button: "Confirm",
            });
        
        //tracingQueries.storeContact(qrDeviceId ,qrSeat, qrModuleCode, qrlocationSession);

        $("#qrseatId").val("");

        $("#qrmoduleCode").val("");

        $("#qrLocation").val("");
        
        document.getElementById("qrCheckin").style.display="none";
        document.getElementById("indexPage").style.display="block";
        
    }
    
}

function notify() {
    getContacts();
}


var positiveDevices;
var negativeDevices;
function getContacts () {
    invokeDatabase.db.transaction(

        function checkTrace(tx) {
            
            tx.executeSql("SELECT DISTINCT tracing.*, results.test from tracing LEFT JOIN results ON tracing.deviceID = results.deviceID",
            [],
            function (tx, results) {
                var lenTracing = results.rows.length;
                console.log("Rows found: " + lenTracing);
                
                // Arrays to store individual details from database for comparison if a device should get a notification
                positiveDevices = []; 
                negativeDevices = [];

                var positiveLocations = [];
                var negativeLocations = [];
                
                var negativeDates = [];
                var positiveDates = [];
                
                // Loop the contacts in database
                for(var i = 0; i<lenTracing; i++){
                    var mobileDevice = results.rows.item(i).deviceID;
                    var testResult = results.rows.item(i).test;
                    var locationCheck = results.rows.item(i).location;
                    var dateCheck = results.rows.item(i).whenAtDate;
                    var timeCheck = results.rows.item(i).whenAtTime;
                    

                    // If device did not report test result add to negativeDevices array otherwise positiveDevices array.
                    if (testResult == null) {
                        negativeDevices.push("Device ID: " + mobileDevice);

                        negativeLocations.push(locationCheck);

                        negativeDates.push(dateCheck);
                    
                        

                    } else {
                        positiveDevices.push("Device ID: " + mobileDevice);

                        positiveLocations.push(locationCheck);

                        positiveDates.push(dateCheck);

                    }
                }
                
                console.log("Positive Devices: " + positiveDevices);
                console.log(positiveLocations);

                console.log(positiveDates);

                
                console.log("Negative Devices: " + negativeDevices);
                console.log(negativeLocations);

                console.log(negativeDates);

                
                // Check if location element in negativeDevices array also exists in positiveDevices and is greater or equal to 1
                const isLocationTrue = negativeLocations.some(locationString=> positiveLocations.includes(locationString) >= 2);


                // Check if date element in negativeDates array also exists in positiveDates and is greater or equal to 1
                const isDateTheSame = negativeDates.some(dateString=> positiveDates.includes(dateString) >= 2);

                console.log("Is positive test result reported in the same location? " + isLocationTrue);


                console.log("Is positive test result reported on the same date? " + isDateTheSame);


                // If negative device is in the same location as positive decide AND on the same module
                if (isLocationTrue === true && isDateTheSame === true) {
                    
                    console.log("Notification displays on mobile devices...");
                    
                    // Set mobile LED to blink
                    cordova.plugins.notification.local.setDefaults({
                        led: { color: '#FFFFFF', on: 500, off: 500 },
                        vibrate: false
                    });

                    // Display mobile notification if condition is met (mobile build only)
                    cordova.plugins.notification.local.schedule({
                        title: 'Contact Tracing Exposure Alert!',
                        text: 'You have been exposed in an area of someone who tested positive. Please book a test and self-isolate!',
                        foreground: true
                    });
                } else {
                    
                    // If no exposures output an alert
                    swal({
                        title: "No new exposure notifications.",
                        text: "Stay safe!",
                        icon: "success",
                        button: "Confirm",
                        });
                }

            })
    })
}



// Function for reporting positive test result
function addTestResult() {
    
    var reportDeviceID = $('#deviceIdReport').val();

    var tests;
    $('#resultID').on('change', function(){
        tests = this.checked ? 1 : 0;
     }).change();
     
    

    if (tests == 1) {
        tracingQueries.storeTestResult(reportDeviceID, tests);

        // Uncheck test result checkbox
        $("#resultID").prop('checked', false);
        
        swal({
            title: "Thank you for submitting your test result!",
            text: "Press the button to proceed",
            icon: "success",
            button: "Confirm",
            });
        
        document.getElementById("reportPage").style.display="none";
        document.getElementById("indexPage").style.display="block";

    } else {
        swal({
            title: "Select ticks that apply to your situation!",
            text: "If you none of the boxes apply to you, you don't need to do anything apart from checking in.",
            icon: "warning",
            button: "Confirm",
        });
    }
}

// Add manual checkin into database (This is alternative when QR scanner does not work).
function addManualCheckIn() {
        
    // Declare IDs of input fields
    var deviceID = $('#deviceIdManual').val();
    var seat = $('#seatIdManual').val();

    // Assign location to capital letters after submission to Web SQL
    var locationSession = $('#locationManual').val().toUpperCase();

    //Restrict user from entering spaces in the input field
    $('#locationManual').keypress(function (evt) {
        var keycode = evt.charCode || evt.keyCode;
        if (keycode == 32) {
            return false;
        }
    });

    

    const labsArray = ['CMPSCI', 'AGACLAB', 'CYBERLAB', 'DATASCIENCE', 'LAB1', 'LAB2', 'MSCLAB',
    'cmpsci', 'agaclab', 'cyberlab', 'datascience', 'lab1', 'lab2', 'msclab'];
    
        // Check for empty fields and if array matches the input.
       if (seat == "" || locationSession == "" || labsArray.indexOf(locationSession) < 0) {
        swal({
            title: "Please enter valid information!",
            text: "This is written on your seat...",
            icon: "warning",
            button: "Confirm",
        });

        } else {
        
        tracingQueries.storeContact(deviceID, seat, locationSession);
        $("#seatIdManual").val("");
        $("#moduleCodeManual").val("");
        $("#locationManual").val("");

        swal({
            title: "Signed in successfully!",
            text: "Press the button to proceed",
            icon: "success",
            button: "Confirm",
            });
       }   
}