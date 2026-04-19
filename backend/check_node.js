import { ethers } from "ethers";
async function check() {
  try {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.chainId);
    const code = await provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log("Contract code length:", code.length);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
check();
