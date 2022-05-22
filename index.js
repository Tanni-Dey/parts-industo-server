const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('parts-industo')
})
app.listen(port, () => {
    console.log('parts-industo', port);
})