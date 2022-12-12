import dotenv from "dotenv";
dotenv.config();

// import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";

import networks from "./networks";

import "./tasks/balance";
import "./tasks/accounts";
import "./tasks/block-number";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  gasReporter: {
    currency: "USD",
    gasPrice: 60,
  },
  networks,
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },

};

export default config;
