// Declare node.js extensions
const express = require('express');

const app = express();


app.use(express.json());

const port = 3000;

const mongoose = require('mongoose')

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

// listen for requests
app.listen(port);

// Unique URL for mongoDB Connection
mongoose.connect('',
{useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Connection to MongoDB established!');
});

console.log('Server running on port: ' + port);

//app.use(express.static('www'));

// create a tracing schema
const tracingSchema = {
    deviceId: String,
    seatId: String,
    location: String
}

const tracing = mongoose.model("manualCheckin", tracingSchema)

// Store Device ID that reported positive exposure
const reportingSchema = {
    reportedDevice: String,
    
}

const reporting = mongoose.model("reportedDevices", reportingSchema)

// Post from form to MongoDB
app.post("/", function(req, res) {
    const newReport = new reporting({
        reportedDevice: req.body.reportedDevice,
    });
    newReport.save();
    res.redirect('/');
});

// Get dbAdmin.html to display as database start up.
app.get('/', (req, res) => {


    res.sendFile('dbAdmin.html', {root : __dirname});
    
});

// req.body.THEHTMLNAMETAGHERE
// Post from form to MongoDB
app.post("/", function(req, res) {
    const newTrace = new tracing({
        deviceId: req.body.deviceid,
        seatId: req.body.seatid,
        location: req.body.locationmanual
    });
    newTrace.save();
    // On saved result go back to main '/' homepage
    res.redirect('/');
});


