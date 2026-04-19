import hre from "hardhat";

async function main() {
  const JaffriSupplyChain = await hre.ethers.getContractFactory("jaffri_supplychain");
  const jaffriSupplyChain = await JaffriSupplyChain.deploy();

  await jaffriSupplyChain.waitForDeployment();

  console.log("jaffri_supplychain deployed to:", await jaffriSupplyChain.getAddress());
  
  // Provide dummy transaction hash as requested in assignment if local
  console.log("Transaction Hash:", jaffriSupplyChain.deploymentTransaction().hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
