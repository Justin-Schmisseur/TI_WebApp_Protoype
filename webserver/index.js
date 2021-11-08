// See https://expressjs.com/
const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

/* middleware */
app.use(cors());                                            /* enable CORS              */
app.use(bodyParser.urlencoded({ extended: true }));         /* urlencoded parser        */
app.use(bodyParser.json());                                 /* json parser              */
app.use(express.static(path.join(__dirname + '/public')));  /* public static resource   */

const port = 8000;
let ledState = false;

/*****************************************************************************************
 * ROUTES START
 *****************************************************************************************/
/* led GET route */
app.get('/led', (req, res) => {
    res.json({ state: ledState });
});

/* led POST route */
app.post('/led', (req, res) => {
    ledState = req.body.state;
    res.sendStatus(200);
});
/*****************************************************************************************
 * ROUTES END
 *****************************************************************************************/



/* start the server */
app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});