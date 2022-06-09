const path = require("path");
const express = require("express");
let dotenv = require("dotenv").config();
const axios = require("axios");

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;
const COVALENT_KEY = process.env.COVALENT_KEY;

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Connected to Server" });
});

app.get("/gettransactions/:address", async (req, res) => {
  const address =
    req.params.address || "0x93690b2a1314634be6727fb57d8b2813b4d2c204"; //random address if none is passed
  //req.params.address || "0xd0f02be394b0C557F6Ff26E20585ebC2B222a77b"; //personal address if none is passed

  let sanctionsArr;
  await axios
    .get(
      `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/?key=ckey_${COVALENT_KEY}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    )
    .then(async (response) => {
      const items = response.data.data.items;
      console.log(
        "1: Number of transactions found for wallet address",
        items.length
      );
      if (items && items.length) {
        sanctionsArr = await getSanctionsFromTransaction(items, address);
        console.log("4: search complete, returning response to user");
        res.json(sanctionsArr);
      } else {
        res.json({
          error: `no sanctions found`,
          details: "no sanctions found",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.json({
        error: `there was an error with your request`,
        details: err,
      });
    });
});

async function getSanctionsFromTransaction(items, address) {
  const sanctionsArr = [];
  const itemsLength = items.length;
  let curIndex = 0;
  for (let i = 0; i < itemsLength; i++) {
    const item = items[i];
    const sanctionsAddress =
      item.from_address !== address ? item.from_address : item.to_address;

    const sanctions = await getSanctionsByAddress(sanctionsAddress);
    console.log(`2: results for ${sanctionsAddress}`, sanctions);
    if (sanctions && sanctions.length) {
      sanctionsArr.push({
        address: sanctionsAddress,
        sanctions: sanctions,
      });
    }
    curIndex++;
    if (curIndex === itemsLength) {
      console.log("3: all transactions analyzed, returning sanctions array");
      return sanctionsArr;
    }
  }
}

async function getSanctionsByAddress(address) {
  const sanctionsByAddressResponse = await axios
    .get(`https://public.chainalysis.com/api/v1/address/${address}`, {
      headers: {
        "X-API-KEY": API_KEY,
        Accept: "application/json",
      },
    })
    .then(async (response) => {
      const identifications = response.data.identifications;
      if (identifications && identifications.length) {
        console.log("3: identifications", identifications[0].name);
        return identifications;
      } else {
        return {
          error: "No sanctions found",
          details: "No sanctions found",
        };
      }
    })
    .catch((err) => {
      console.error(err);
      return {
        error: `there was an error with your request`,
        details: err,
      };
    });
  return sanctionsByAddressResponse;
}

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
