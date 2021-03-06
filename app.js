const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Vonage = require('@vonage/server-sdk')
const socketio = require('socket.io');

// Intialize the vonage 

const vonage = new Vonage({
  apiKey: "a17b802f",
  apiSecret: "z0Ok3eFNvcEntFDp"
})


const app = express();

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Bodyparser middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('index');
});


app.post('/', (req, res) => {
  // res.send(req.body);
  // console.log(req.body);
  const from = "Vonage APIs"
  const to = req.body.number;
  const text = req.body.text;

  
  // const text = 'A text message sent using the Vonage SMS API'

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]['status'] === "0") {
        console.log("Message sent successfully.");
        // Get Data from response
        const data = {
          id: responseData.messages[0]['message-id'],
          number: responseData.messages[0]['to']
        }

        // Emit to the client 
        io.emit('smsStatus',data);
      } else {
        console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
      }
    }
  })
})

const port = Process.env.PORT || 3000 ;

const server = app.listen(port, () => console.log(`Server started on port ${port}`));

// Connect to socket io
const io = socketio(server);
io.on('connection',(socket)=>{
  console.log('Connected');
  io.on('disconnect',()=>{
    console.log('Disconnected');
  })
})
