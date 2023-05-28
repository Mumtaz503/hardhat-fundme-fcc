const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");


describe("fundme", async function () {

    let fundMe;
    let deployer;
    let mockV3Aggregator;
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("fundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("constructor", async function () {
        it("Setting Aggregator Address Correctly", async function () {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.address)

        });

    });

});