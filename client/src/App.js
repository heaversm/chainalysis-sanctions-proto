import React, { useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);
  const [address, setAddress] = useState("");
  const [sanctions, setSanctions] = useState(null);

  const defaultAddress = "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a";

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`/getsanctions/${address ? address : defaultAddress}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setData(data.error);
          console.log(data.details);
        } else {
          console.log(data);
          setSanctions(data);
          setData("Displaying Sanctions Results");
        }
      });
  };

  const RenderSanctions = () => {
    const sanctionsItems = sanctions.map((sanctionItem, index) => {
      const sanctionIndex = `sanction-${index}`;

      return (
        <li className="sanction-item" key={sanctionIndex}>
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
        <p>
          <span className="bold">Status</span>: {!data ? "Loading..." : data}
        </p>
      </header>
      <main className="App-main">
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
      </main>
    </div>
  );
}

export default App;
