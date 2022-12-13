import { expect } from 'chai';
import '@nomiclabs/hardhat-ethers';
import { ethers, deployments, network } from 'hardhat';
import { mine } from '@nomicfoundation/hardhat-network-helpers';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FirstComeFirstServed } from '../typechain-types';

import { getBalanceETH, getCurrentBlockNumber, takeChainSnapshot } from '../utils/hardhat-test-util';

describe('FirstComeFirstServed', async () => {
  let owner: SignerWithAddress;
  let accounts: SignerWithAddress[];
  let contract: FirstComeFirstServed;

  before(async () => {
    const { FirstComeFirstServed } = await deployments.fixture(['FirstComeFirstServed']);

    contract = (await ethers.getContractAt(
      'FirstComeFirstServed',
      FirstComeFirstServed.address,
      owner,
    )) as FirstComeFirstServed;

    accounts = await ethers.getSigners();
    owner = accounts[0];

    console.log(`owner has: ${ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)).toString()}`);
    await owner.sendTransaction({ to: contract.address, value: ethers.utils.parseEther('20') });
    console.log('owner send 20ETH to contract');
    console.log(`contract has: ${ethers.utils.formatEther(await contract.getBalance())} ETH`);

    console.log(`Genesis BlockNumber: ${(await contract.GENESIS_BLOCK_NUMBER()).toString()}`);
  });

  it('account can entry init round', async () => {
    expect(await contract.getCurrentRound()).to.be.equal(1);

    const laterAccount = accounts[6];

    for (var i = 0; i < 5; i++) {
      await contract.connect(accounts[i + 1]).entry();
    }

    await expect(contract.connect(laterAccount).entry()).to.be.revertedWith('current round is fulled');
    expect(await contract.getBalance()).to.be.lte(ethers.utils.parseEther('20'));

    const entriedAddresses = await contract.getCurrentEntries();
    expect(JSON.stringify(entriedAddresses)).to.be.equal(
      JSON.stringify([
        accounts[1].address,
        accounts[2].address,
        accounts[3].address,
        accounts[4].address,
        accounts[5].address,
      ]),
    );

    await mine(1000);
    expect(await contract.getCurrentRound()).to.be.equal(2);
  });

  it('account can entry 2nd round', async () => {
    expect(await contract.getCurrentRound()).to.be.equal(2);

    const laterAccount = accounts[7];

    for (var i = 0; i < 5; i++) {
      await contract.connect(accounts[i + 2]).entry();
    }

    await expect(contract.connect(laterAccount).entry()).to.be.revertedWith('current round is fulled');

    const entriedAddresses = await contract.getCurrentEntries();
    expect(JSON.stringify(entriedAddresses)).to.be.equal(
      JSON.stringify([
        accounts[2].address,
        accounts[3].address,
        accounts[4].address,
        accounts[5].address,
        accounts[6].address,
      ]),
    );

    await mine(1000);
    expect(await contract.getCurrentRound()).to.be.equal(3);
  });

  it('account can entry 3rd round, but entried count was 4 and next rounde started', async () => {
    expect(await contract.getCurrentRound()).to.be.equal(3);

    for (var i = 0; i < 4; i++) {
      await contract.connect(accounts[i + 3]).entry();
    }
    let entriedAddresses = await contract.getCurrentEntries();
    expect(JSON.stringify(entriedAddresses)).to.be.equal(
      JSON.stringify([accounts[3].address, accounts[4].address, accounts[5].address, accounts[6].address]),
    );
    await mine(1000); // round 4
    expect(await contract.getCurrentRound()).to.be.equal(4);

    await contract.connect(accounts[1]).entry();
    entriedAddresses = await contract.getCurrentEntries();
    expect(JSON.stringify(entriedAddresses)).to.be.equal(JSON.stringify([accounts[1].address]));

    await mine(1000); // round 5
    console.log(await contract.getBlockNumber());
    expect(await contract.getCurrentRound()).to.be.equal(5);
  });
});
