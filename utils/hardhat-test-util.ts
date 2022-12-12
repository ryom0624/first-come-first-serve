import { expect } from "chai";
import { ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hre from "hardhat";

const ethers = hre.ethers;

// chai EmitAssertion の shorthand
const expectEvent = async (txPromise: Promise<ContractTransaction>, expectEvent: string, ...args: string[]) => {
  const { events } = await (await txPromise).wait();
  if (!events) {
    return;
  }
  const event = events[0];
  expect(event.event).to.be.equal(expectEvent);
  args.forEach((arg, i) => {
    if (event.args) {
      expect(event.args[i].toString()).to.be.equal(arg);
    }
  });
};

const getCurrentBlockNumber = async () => {
  return await ethers.provider.getBlockNumber();
};

const getBalanceETH = async (account: SignerWithAddress): Promise<number> => {
  const balance = await ethers.provider.getBalance(account.address);
  return Number(ethers.utils.formatEther(balance));
};

const advanceTime = async (time: number) => {
  await new Promise((resolve, reject) => {
    hre.network.provider.sendAsync(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });

  await new Promise((resolve, reject) => {
    hre.network.provider.sendAsync(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        params: [],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });

  return true;
};

// https://hardhat.org/hardhat-network/docs/reference#evm_snapshot
const takeChainSnapshot = async () => {
  return await new Promise((resolve, reject) =>
    hre.network.provider.sendAsync(
      {
        jsonrpc: "2.0",
        method: "evm_snapshot",
        params: [],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        let snapshotId = result.result; // {"id":X,"jsonrpc":"2.0","result":"0x..."}
        return resolve(snapshotId);
      }
    )
  );
};

const revertChainSnapshot = async (snapshotId: string) => {
  return await new Promise((resolve, reject) =>
    hre.network.provider.sendAsync(
      {
        jsonrpc: "2.0",
        method: "evm_revert",
        params: [snapshotId],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    )
  ).catch((e) => console.error(e));
};

export { expectEvent, getCurrentBlockNumber, getBalanceETH, advanceTime, takeChainSnapshot, revertChainSnapshot };
