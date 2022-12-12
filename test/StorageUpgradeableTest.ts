import { expect } from "chai";
import "@nomiclabs/hardhat-ethers";
import { ethers, deployments } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StorageUpgradeable } from "../typechain-types";

describe("StorageUpgradeable", async () => {
  let signer: SignerWithAddress;
  let storage: StorageUpgradeable;

  beforeEach(async () => {
    const { StorageUpgradeable } = await deployments.fixture(["StorageUpgradeable"]);
    storage = (await ethers.getContractAt("StorageUpgradeable", StorageUpgradeable.address, signer)) as StorageUpgradeable;
    [signer] = await ethers.getSigners();
  });

  it("default greeting value is 42", async () => {
    expect(await storage.connect(signer).x()).to.be.equal(42);
  });

  it("upgradeable", async () => {
    expect(await storage.connect(signer).upgradeFunc()).to.be.equal(1);
  });
});
