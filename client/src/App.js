import React, { useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);
  const [address, setAddress] = useState("");
  const [sanctions, setSanctions] = useState(null);

  const defaultAddress = "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a";
  const defaultTransactionAddress =
    "0x93690b2a1314634be6727fb57d8b2813b4d2c204";
  //const defaultTransactionAddress = "0xd0f02be394b0C557F6Ff26E20585ebC2B222a77b";

  const handleSubmit = (e) => {
    e.preventDefault();
    setData("Analyzing Transactions");
    fetch(`/gettransactions/${address ? address : defaultTransactionAddress}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setData(data.error);
          console.log(data.details);
        } else {
          console.log(data);
          setSanctions(data);
          setData("Displaying Address Transactions");
        }
      });
  };

  const RenderSanctions = () => {
    const sanctionsItems = sanctions.map((sanctionObj, index) => {
      const sanctionIndex = `sanction-${index}`;
      const sanctionItem = sanctionObj.sanctions[0];
      const sanctionAddress = sanctionObj.address;

      return (
        <li className="sanction-item" key={sanctionIndex}>
          <p>
            <span className="bold">Sanction Address:</span> {sanctionAddress}
          </p>
          <p>
            <span className="bold">Sanction:</span> {sanctionItem.name}
          </p>
          {sanctionItem.description && (
            <p>
              <span className="bold">Description:</span>{" "}
              {sanctionItem.description}
            </p>
          )}
          {sanctionItem.url && (
            <p>
              <a
                href={sanctionItem.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View More
              </a>
            </p>
          )}
        </li>
      );
    });
    return <ul>{sanctionsItems}</ul>;
  };

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chainalysis Sanctions API Prototype</h1>
        <p>
          <span className="bold">Purpose: </span>This prototype scans a wallet
          address for transactions on [Ethereum] for possible interactions with
          &nbsp;
          <a
            href="https://go.chainalysis.com/chainalysis-oracle-docs.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            sanctioned wallet addresses
          </a>
          &nbsp;using the &nbsp;
          <a
            href="https://www.covalenthq.com/docs/api/#/0/Get%20transactions%20for%20address/USD/1"
            target="_blank"
            rel="noopener noreferrer"
          >
            covalent
          </a>
          &nbsp;and&nbsp;
          <a
            href="https://go.chainalysis.com/chainalysis-oracle-docs.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            chainalysis
          </a>{" "}
          APIs.
        </p>
        <p>
          <span className="bold">Instructions: </span>Insert a wallet address to
          see if it has interacted with a sanctioned address. Note that the
          likelihood of this occurring is rare - to see a working example,
          submit the form with a blank input field.
        </p>
      </header>
      <hr></hr>
      <main className="App-main">
        <p>
          <span className="bold">Status</span>: {!data ? "Loading..." : data}
        </p>
        <div className="analyze-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="address" className="analyze-label analyze-el">
              Enter Address to Analyze
            </label>
            <br />
            <input
              type="text"
              className="analyze-input analyze-el"
              id="address"
              placeholder="0x000..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <br />
            <button type="submit" className="analyze-submit analyze-el">
              Analyze
            </button>
          </form>
        </div>
        {sanctions && (
          <div className="sanctions-container">
            <p>Sanctions:</p>
            <div className="sanctions-list-container">
              <RenderSanctions />
            </div>
          </div>
        )}
        <hr />
        <div>
          <p>
            <span className="bold">Note:</span>The eventual purpose of this
            prototype would be to use the{" "}
            <a
              href="https://www.chainalysis.com/chainalysis-kyt/"
              target="_blank"
              rel="noopener noreferrer"
            >
              chainalysis KYT API
            </a>
            instead of Sanctions for analyzing transaction risk
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
