import { ethers } from "ethers";
async function test() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const abi = ["function registerProduct(string, string) public returns (uint256)", "function nextProductId() public view returns(uint256)"];
  const contract = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", abi, wallet);
  try {
    const nextId = await contract.nextProductId();
    console.log("Next ID:", nextId);
    const tx = await contract.registerProduct("Apple", "Fresh Apple");
    const receipt = await tx.wait();
    console.log("Success! Tx:", receipt.hash);
  } catch(e) {
    console.log("ERROR:", e);
  }
}
test();
