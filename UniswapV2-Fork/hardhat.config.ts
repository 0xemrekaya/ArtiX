import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      }
    ],
  },
  networks: {
    abcTestnet: {
      url: "https://rpc.abc.t.raas.gelato.cloud", // chain's RPC URL
      chainId: 112, // chain's ID
      accounts: [process.env.PRIVATE_KEY || ""], // Private key for deployment
      gas: 2100000,
      gasPrice: 8000000000, // 8 gwei
      timeout: 20000
    }
  }

};

export default config;
