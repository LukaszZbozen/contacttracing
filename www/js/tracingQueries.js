var tracingQueries= {
    
    storeContact: function (deviceID, seatID, location) {
        
        invokeDatabase.db.transaction(function (tx) {
            // Enter check in data and store in database
            tx.executeSql(
                "INSERT INTO tracing (deviceID, seatID, location) VALUES (?,?,?)",
                [deviceID, seatID, location],
                function (tx, result) {            

                    // Output in console the field that is added to the database
                    console.log(deviceID + " " + seatID + " " + " has signed in to: " + location);
                    
                },
                function (tx, error) {
                    console.log("Error with storing contact to database: " + error.message);
                }
            );
        })
    },
    // Store reported exposure from checkboxes (0,1)
    storeTestResult: function (resultDeviceID, tests, exposure) {
        
        invokeDatabase.db.transaction(function (tx) {
            // Enter check in data and store in database
            tx.executeSql(
                "INSERT INTO results (deviceID, test, exposure) VALUES (?,?,?)",
                [resultDeviceID, tests, exposure],
                function (tx, result) {
                                      
                   // Output in console the field that is added to the database
                    console.log("Device ID: " + resultDeviceID +  " Reported test result! " + tests + " " + exposure);

                },
                function (tx, error) {
                    console.log("Error with storing test result to database: " + error.message);
                }
            );
        })
    }
}