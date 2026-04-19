import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// We put a local mock or a real contract ABI here
const contractABI = [
  "event ProductRegistered(uint256 indexed productId, string name, address indexed owner)",
  "event ProductTransferred(uint256 indexed productId, address indexed from, address indexed to, uint8 newRole, uint8 newStatus)",
  "function registerProduct(string memory _name, string memory _description) public returns (uint256)",
  "function transferProduct(uint256 _productId, address _newOwner, uint8 _newRole, uint8 _newStatus) public",
  "function getProductHistory(uint256 _productId) public view returns (tuple(address passedFrom, address passedTo, uint8 newRole, uint8 newStatus, uint256 timestamp)[])",
  "function products(uint256) public view returns (uint256 id, string name, string description, address currentOwner, uint8 ownerRole, uint8 status)",
  "function nextProductId() public view returns (uint256)"
];
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost hardhat deployment address (adjust when deployed)

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Forms states
  const [regName, setRegName] = useState("");
  const [regDesc, setRegDesc] = useState("");

  const [transId, setTransId] = useState("");
  const [transNewOwner, setTransNewOwner] = useState("");
  const [transRole, setTransRole] = useState("1"); // Default Distributor
  const [transStatus, setTransStatus] = useState("1"); // Default InTransit

  const [historyId, setHistoryId] = useState("");
  const [productHistory, setProductHistory] = useState([]);
  const [productDetails, setProductDetails] = useState(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        await _provider.send("eth_requestAccounts", []);
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        const _contract = new ethers.Contract(contractAddress, contractABI, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setContract(_contract);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (err) {
      console.error(err);
    }
    setIsConnecting(false);
  };

  const registerProduct = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      const tx = await contract.registerProduct(regName, regDesc);
      await tx.wait();
      alert("Product Registered Successfully!");
    } catch (err) {
      console.error(err);
      alert("Error registering product!");
    }
  };

  const transferProduct = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      const tx = await contract.transferProduct(transId, transNewOwner, parseInt(transRole), parseInt(transStatus));
      await tx.wait();
      alert("Product Transferred!");
    } catch (err) {
      console.error(err);
      alert("Error transferring product!");
    }
  };

  const getHistory = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      const details = await contract.products(historyId);
      setProductDetails(details);
      const history = await contract.getProductHistory(historyId);
      setProductHistory(history);
    } catch (err) {
      console.error(err);
      alert("Error fetching history! Check product ID.");
    }
  };

  const getRoleName = (r) => ["Manufacturer", "Distributor", "Retailer", "Customer"][Number(r)] || "Unknown";
  const getStatusName = (s) => ["Manufactured", "In Transit", "Delivered"][Number(s)] || "Unknown";

  return (
    <div className="app-container">
      <header className="glass-header">
        <h1>Suppy Chain DApp</h1>
        <div className="header-info">
          <span>By <strong>Jaffri</strong></span>
          {account ? (
            <div className="wallet-badge glass-panel">Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</div>
          ) : (
            <button className="glass-button" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}
        </div>
      </header>

      <main className="content">
        <section className="glass-panel">
          <h2>Register New Product</h2>
          <form onSubmit={registerProduct}>
            <input type="text" placeholder="Product Name" value={regName} onChange={e => setRegName(e.target.value)} required />
            <input type="text" placeholder="Description" value={regDesc} onChange={e => setRegDesc(e.target.value)} required />
            <button type="submit" className="glass-button primary">Register</button>
          </form>
        </section>

        <section className="glass-panel">
          <h2>Transfer Ownership</h2>
          <form onSubmit={transferProduct}>
            <input type="number" placeholder="Product ID" value={transId} onChange={e => setTransId(e.target.value)} required />
            <input type="text" placeholder="New Owner Address" value={transNewOwner} onChange={e => setTransNewOwner(e.target.value)} required />

            <select value={transRole} onChange={e => setTransRole(e.target.value)}>
              <option value="1">Distributor</option>
              <option value="2">Retailer</option>
              <option value="3">Customer</option>
            </select>

            <select value={transStatus} onChange={e => setTransStatus(e.target.value)}>
              <option value="1">In Transit</option>
              <option value="2">Delivered</option>
            </select>

            <button type="submit" className="glass-button primary">Transfer</button>
          </form>
        </section>

        <section className="glass-panel history-section">
          <h2>View Product History</h2>
          <form onSubmit={getHistory} className="inline-form">
            <input type="number" placeholder="Product ID" value={historyId} onChange={e => setHistoryId(e.target.value)} required />
            <button type="submit" className="glass-button">Search</button>
          </form>

          {productDetails && (
            <div className="details-card">
              <h3>Product Info</h3>
              <p><strong>Name:</strong> {productDetails.name}</p>
              <p><strong>Current Owner:</strong> {productDetails.currentOwner}</p>
              <p><strong>Role:</strong> {getRoleName(productDetails.ownerRole)}</p>
              <p><strong>Status:</strong> {getStatusName(productDetails.status)}</p>
            </div>
          )}

          {productHistory.length > 0 && (
            <div className="history-timeline">
              <h3>Audit Trail</h3>
              {productHistory.map((entry, index) => (
                <div key={index} className="timeline-item">
                  <div className="stamp">{new Date(Number(entry.timestamp) * 1000).toLocaleString()}</div>
                  <div className="action">
                    Passed to <strong>{entry.passedTo}</strong> as <strong>{getRoleName(entry.newRole)}</strong> - Status: <strong>{getStatusName(entry.newStatus)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer>
        <p>Assignment 3 Developed by Jaffri &copy; 2026</p>
      </footer>
    </div>
  );
}

export default App;
