const { ethers, network } = require("hardhat");
const { getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { expect, assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fundme", async function () {

        let fundMe;
        let deployer;
        const sentValue = await ethers.utils.parseEther("0.026");
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            fundMe = await ethers.getContract("FundMe", deployer);
        });

        it("Should Fund and Withdraw from contract", async function () {
            await fundMe.fund({ value: sentValue });
            await fundMe.withdraw();
            const endingBalance = await fundMe.provider.getBalance(fundMe.address);
            assert.equal(endingBalance.toString(), 0).to.be.reverted;
        });

    });