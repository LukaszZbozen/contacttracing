/*
*   Author: znu16qvu, 100170451
*
*   Description: Javascript to run functions across the whole mobile app.
*   Reference: https://cordova.apache.org/docs/en/latest/
*   Version: 1.0
*/


// Detect if the device is loaded and running...
document.addEventListener("deviceready", onDeviceReady, false);

// Global variable for unique device ID
var uniqueDeviceID;

/*
* Run on onDeviceReady function when the app starts.
*/
function onDeviceReady() {
    
    console.log("Mobile device running...");

    

    // Assign a unique string to each and new device that uses the app
    // Android: Returns a random 64-bit integer
    //          The integer is generated on the device's first boot
    uniqueDeviceID = device.uuid;

    // Call database script to create web sql object
    invokeDatabase.createDatabase();


    // On app start up assign unique device ID to input fields
    document.getElementById('deviceIdManual').value=uniqueDeviceID;
    document.getElementById('deviceIdReport').value=uniqueDeviceID;

    
  
    
    // When user releases finger from the selected option - ("touchend"), run qrCodeScanner function.
    document.querySelector("#qrCodeScanner").addEventListener("touchend", qrCodeScanner, false);

    // Call getContacts function to check for virus exposure on each start up
    getContacts();

    // Get self-isolation timer
    loadEventListeners();

    
    
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
        showFlipCameraButton : false, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        prompt : "Aim your camera at the QR code!", // Android
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
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


    // If QR code is null display error message
    if (qrSeat == "" && qrDeviceId == "" &&  qrlocationSession == "") { 
        swal({
            title: "You must scan a QR code!",
            text: "Please try again or use manual check-in!",
            icon: "warning",
            button: "Confirm",
            });
    } else {
        tracingQueries.storeContact(qrDeviceId ,qrSeat, qrlocationSession);
        // On successful check-in store to Web sql and output message

        swal({
            title: "You have checked in successfully!",
            text: "Press the button to proceed",
            icon: "success",
            button: "Confirm",
            });
        
        //tracingQueries.storeContact(qrDeviceId ,qrSeat, qrModuleCode, qrlocationSession);

        // Empty fields to null
        $("#qrseatId").val("");

        $("#qrmoduleCode").val("");

        $("#qrLocation").val("");

        
        // Return to index page
        document.getElementById("qrCheckin").style.display="none";
        document.getElementById("indexPage").style.display="block";
        
    }
    
}

// On press of notification bell check current exposure (No new exposures || send notification to mobile device)
function notify() {
    getContacts();
}

// Global arrays for device comparing logic
var positiveDevices;
var negativeDevices;

var positiveLocations;
var negativeLocations;

var negativeDates;
var positiveDates;

function getContacts () {
    invokeDatabase.db.transaction(

        function checkTrace(tx) {
            var start = window.performance.now();
            // Select from database
            tx.executeSql("SELECT DISTINCT tracing.*, results.test, results.exposure from tracing LEFT JOIN results ON tracing.deviceID = results.deviceID",
            [],
            function (tx, results) {
                var lenTracing = results.rows.length;
                console.log("Rows found: " + lenTracing);
                
                // Arrays to store individual details from database for comparison if a device should get a notification
                positiveDevices = []; 
                negativeDevices = [];

                positiveLocations = [];
                negativeLocations = [];
                
                negativeDates = [];
                positiveDates = [];
                
                // Loop each new contact trace in Web sql
                for(var i = 0; i<lenTracing; i++){
                    var mobileDevice = results.rows.item(i).deviceID;
                    var testResult = results.rows.item(i).test;
                    var exposureResult = results.rows.item(i).exposure;
                    var locationCheck = results.rows.item(i).location;
                    var dateCheck = results.rows.item(i).whenAtDate;
                    var timeCheck = results.rows.item(i).whenAtTime;
                    

                    // If device did not report test result add to negativeDevices array otherwise positiveDevices array.
                    if (testResult == null || exposureResult == null) {
                        negativeDevices.push("Device ID: " + mobileDevice);

                        negativeLocations.push(locationCheck);

                        negativeDates.push(dateCheck);
                    
                        

                    } else {
                        positiveDevices.push("Device ID: " + mobileDevice);

                        positiveLocations.push(locationCheck);

                        positiveDates.push(dateCheck);

                        
                    }
                }
                
                // Output to console to test correct storage
                console.log("Positive Devices: " + positiveDevices);
                console.log(positiveLocations);

                console.log(positiveDates);

                
                console.log("Negative Devices: " + negativeDevices);
                console.log(negativeLocations);

                console.log(negativeDates);

                
                // Check if location element in negativeDevices array also exists in positiveDevices and is greater or equal to 1
                const isLocationTrue = negativeLocations.some(locationString=> positiveLocations.includes(locationString) >= 1);


                // Check if date element in negativeDates array also exists in positiveDates and is greater or equal to 1
                const isDateTheSame = negativeDates.some(dateString=> positiveDates.includes(dateString) >= 1);

                console.log("Is positive test result reported in the same location? " + isLocationTrue);


                console.log("Is positive test result reported on the same date? " + isDateTheSame);


                // If negative device is in the same location as positive decide AND on the same module
                if (isLocationTrue === true && isDateTheSame === true) {
                    
                    console.log("Notification displays on mobile devices...");
                    
                    // Set mobile LED to blink in red every 2 seconds
                    cordova.plugins.notification.local.setDefaults({
                        led: { color: '#f21919', on: 2000, off: 2000 },
                        vibrate: false
                    });

                    // Display mobile notification if condition is met (mobile build only)
                    cordova.plugins.notification.local.schedule({
                        title: 'Contact Tracing Exposure!',
                        text: 'You have been exposed in an area of someone who reported positive exposure. Please book a test and self-isolate!',
                        foreground: true
                    });

                    document.getElementById("emailSection").style.display="block";

                } else {
                    
                    document.getElementById("emailSection").style.display="none";

                    // If no exposures output an alert
                    swal({
                        title: "No new exposure notifications.",
                        text: "Stay safe!",
                        icon: "success",
                        button: "Confirm",
                        });

                }
                // Calculate time to run the function
                var end = window.performance.now();
                var dur = end - start;
                console.log(dur);
            })
    })
}

// Function to generate pre-defined emails to send to online db
function emailComposer () {
    cordova.plugins.email.open({
        to:      'znu16qvu@uea.ac.uk',
        cc:      'tracingDBAdmin@uea.ac.uk',
        bcc:     [''],
        subject: 'Virus Exposure Report',
        body:    'Following devices reported positive exposure. Device ID: ' + positiveDevices + 
        ' at ' + positiveLocations + ' on ' +  positiveDates + '.'
    });
}


// Function for reporting positive test result
function addTestResult() {
    
    var reportDeviceID = $('#deviceIdReport').val();

    

    // Store checkboxes as 1 for true and 0 for false
    var tests;
    $('#resultID').on('change', function(){
        tests = this.checked ? 1 : 0;
     }).change();

     var reportExposure;
     $('#exposureID').on('change', function(){
        reportExposure = this.checked ? 1 : 0;
     }).change();
     
    
    // If either of checkboxes are ticked store exposure to Web SQL
    if (tests == 1 || reportExposure == 1) {
        tracingQueries.storeTestResult(reportDeviceID, tests, reportExposure);

        // Uncheck test result checkbox
        $("#resultID").prop('checked', false);
        
        $("exposureID").prop('checked', false);
        
        // Confirmation message
        swal({
            title: "Thank you for submitting your test result!",
            text: "Press the button to proceed",
            icon: "success",
            button: "Confirm",
            });
        
        // When checkbox submitted go back to index page
        document.getElementById("reportPage").style.display="none";
        document.getElementById("indexPage").style.display="block";

    } else {
        // When no checkbox ticked output message
        swal({
            title: "Select ticks that apply to your situation!",
            text: "If none of the boxes apply to you, you don't need to do anything apart from checking in.",
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

    // Assign location to upper case characters after submission to Web SQL
    var locationSession = $('#locationManual').val();

        // Check for empty fields and if array matches the input.
       if (seat == "" || locationSession == "") {
        swal({
            title: "Please enter valid check-in details!",
            text: "This is written on your seat/PC...",
            icon: "warning",
            button: "Confirm",
            });

        } else {
        // Submit to Web SQL followed by confirmation message
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


// Function to calculate self-isolation
function loadEventListeners() {
    document.addEventListener('DOMContentLoaded', function() { calcTime(); });
  };
  
  var timeTo = document.getElementById('time-to'),
      date,
      now = new Date(),
      newYear = new Date().getTime(),
      startTimer = '';
  
  // calculate date, hour, minute and second
  function calcTime(dates) {
    //ui variables
    clearInterval(startTimer);
  
    if(typeof(dates) == 'undefined'){
      date = new Date(newYear).getTime();
    }else {
      date = new Date(dates).getTime();
    }
  
    function updateTimer(date){
  
      var now = new Date().getTime();
      var distance = date - now;
  
      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
      // select element
      document.querySelector('.clock-day').innerHTML = days;
      document.querySelector('.clock-hours').innerHTML = hours;
      document.querySelector('.clock-minutes').innerHTML = minutes;
      document.querySelector('.clock-seconds').innerHTML = seconds;
  
      if(now >= date){
        clearInterval(startTimer);
        document.querySelector('.clock-day').innerHTML = 'Self-Isolation';
        document.querySelector('.clock-hours').innerHTML = 'Finished';
        document.querySelector('.clock-minutes').innerHTML = '';
        document.querySelector('.clock-seconds').innerHTML = '';
        
      }
    }
  
    startTimer = setInterval(function() { updateTimer(date); }, 1000);
  
  }
  