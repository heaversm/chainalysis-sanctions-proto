const path = require("path");
const express = require("express");
let dotenv = require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Connected to Server" });
});

app.get("/getsanctions/:address", (req, res) => {
  const address =
    req.params.address || "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a"; //random address if none is passed

  //https://public.chainalysis.com/api/v1/address/0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a'
  axios
    .get(`https://public.chainalysis.com/api/v1/address/${address}`, {
      headers: {
        "X-API-KEY": API_KEY,
        Accept: "application/json",
      },
    })
    .then((response) => {
      console.log("success");
      const identifications = response.data.identifications;
      console.log(identifications);
      const sanctions = identifications.length
        ? identifications
        : ["none found"];
      res.json(sanctions);
    })
    .catch((err) => {
      console.error(err);
      res.json({
        error: `there was an error with your request`,
        details: err,
      });
    });
});

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
