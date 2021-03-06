/*
*   Author: znu16qvu, 100170451
*
*   Description: JS to open database with Web SQL.
*
*   Version: 1.0
*/
var invokeDatabase = {
    
    // Declare global variable for invoking database and create new database tracing.db
    db: null,
    createDatabase: function() {
        this.db = window.openDatabase(
            "tracing.db",
            "1.0",
            "Contact Tracing Database",
            1024 * 32);
            
        this.db.transaction(function(tx) {
                /* Create table tracing to store check ins
                * (ID, deviceID, seatID, moduleCode, location, whenAtDate, whenAtTime)
                */
                tx.executeSql("CREATE TABLE IF NOT EXISTS tracing(tracingid INTEGER UNIQUE PRIMARY KEY, deviceID TEXT NOT NULL," +
                " seatID TEXT NOT NULL, location TEXT NOT NULL," +
                " whenAtDate DATE NOT NULL DEFAULT CURRENT_DATE," +
                " whenAtTime TIMESTAMP  DATETIME NOT NULL DEFAULT(STRFTIME('%H:%M', 'NOW', 'localtime')))"),
                [],
                // Delete data that is older than 14 days since registered in the database

                tx.executeSql("DELETE FROM tracing WHERE whenAtDate < datetime('now', '-0 day')")
                

                    // If the database is created along with the table run this to the console.
                    console.log("Tracing table created..."),
                    function(tx, results) {
                        
                    },
                    // Error output if database is not created
                    function(tx, error) {
                        console.log("Error with tracing table query " + error.message);
                    }
            }
        );

        this.db.transaction(function(tx) {
            /* Create table results to store positve virus exposure
             */
            tx.executeSql("CREATE TABLE IF NOT EXISTS results(testid INTEGER UNIQUE PRIMARY KEY," +
            " deviceID TEXT NOT NULL, test BOOLEAN NOT NULL CHECK (test IN (0,1)), exposure BOOLEAN NOT NULL CHECK (exposure IN (0,1))," +
            " whenAtDate DATE NOT NULL DEFAULT CURRENT_DATE," +
            " whenAtTime TIMESTAMP DATETIME NOT NULL DEFAULT(STRFTIME('%H:%M', 'NOW', 'localtime')))"),
            [],
            // Delete data that is older than 14 days since registered in the database

            tx.executeSql("DELETE FROM results WHERE whenAtDate < datetime('now', '-0 day')")
            

                // If the database is created along with the table run this to the console.
                console.log("Result table created..."),
                function(tx, results) {
                    
                },
                // Error output if database is not created
                function(tx, error) {
                    console.log("Error with result table query " + error.message);
                }
        }
    );
    }
};
