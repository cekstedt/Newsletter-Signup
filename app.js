const express = require("express");
const request = require("request");
const https = require("https");
const bodyParser = require("body-parser");
const HttpsProxyAgent = require("https-proxy-agent");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  const proxyServer = process.env.HTTPS_PROXY;
  const apiKey = process.env.API_KEY;
  const listID = process.env.LIST_ID;
  const url = "https://us18.api.mailchimp.com/3.0/lists/" + listID;

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };
  const jsonData = JSON.stringify(data);

  const options = {
    auth: "anystring:" + apiKey,
    method: "POST"
  };

  if (proxyServer) {
    options.agent = new HttpsProxyAgent(proxyServer);
  }

  const request = https.request(url, options, function(response) {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function(data) {
      // console.log(JSON.parse(data));
    })
  })

  request.write(jsonData);
  request.end();

});

app.post("/failure", function(req, res) {
  res.redirect("/");
})

app.listen(port, function() {
  console.log("Server started on port " + port);
});