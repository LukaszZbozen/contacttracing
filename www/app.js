const express = require('express');

const app = express();

const port = 3000;

const mongoose = require('mongoose')

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

// listen for requests
app.listen(port);

mongoose.connect('mongodb+srv://znu16qvu:test1234@utracer.sohya.mongodb.net/tracing?retryWrites=true&w=majority',
{useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Connection to MongoDB established!');
});



console.log('Server running on port: ' + port);

app.use(express.static('www'));

// create a tracing schema
const tracingSchema = {
    deviceId: String,
    seatId: String,
    location: String
}

const tracing = mongoose.model("tracing", tracingSchema)

app.get('/', (req, res) => {


    res.sendFile('index.html', {root : __dirname});
    
});

// req.body.THEHTMLNAMETAGHERE

app.post("/", function(req, res) {
    const newTrace = new tracing({
        deviceId: req.body.deviceid,
        seatId: req.body.seatid,
        location: req.body.locationmanual
    });
    newTrace.save();
    res.redirect('/');
});

app.use(express.json());

