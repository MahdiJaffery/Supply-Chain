import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    }
  }
};
