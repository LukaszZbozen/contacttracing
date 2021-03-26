const express = require('express');

const app = express();

// listen for requests
app.listen(3000);

app.use(express.static('www'));

app.get('/', (req, res) => {


    res.sendFile('index.html', {root : __dirname});
    
});