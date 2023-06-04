const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
//require("@nomiclabs/hardhat-waffle");

//in testing you desribe what the input is and test if it fails consult fund it function

!developmentChains.includes(network.name) ? describe.skip :
    describe("fundme", async function () {

        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sentValue = await ethers.utils.parseEther("1");
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        });

        describe("constructor", async function () {
            it("Setting Aggregator Address Correctly", async function () {
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address);
            });
        });
        describe("Fund", async function () {
            //you're basically providing 0 value and test if the transaction is reverted with a message "You need to..."
            it("Checking minimum value input", async function () {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
            });
            it("Checking if the value is updating", async function () {
                await fundMe.fund({ value: sentValue });
                const response = await fundMe.getaddressToAmmountFunded(deployer);
                assert.equal(response.toString(), sentValue.toString());
            });
            it("Adding the funders to array", async function () {
                await fundMe.fund({ value: sentValue });
                const funder = await fundMe.getFunderAt(0);
                assert.equal(funder, deployer);
            });

        });
        describe("Withdraw", async function () {
            beforeEach(async function () {
                await fundMe.fund({ value: sentValue });
            });
            it("Withdraw funds to the owner", async function () {
                //Arrange the test

                const startingBalanceFundme = await fundMe.provider.getBalance(fundMe.address);
                const deployerStartingBalance = await fundMe.provider.getBalance(deployer);
                //Then act on it pass values and stuff

                const transactionResponse = await fundMe.withdraw();
                const transactionReciept = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReciept;

                const gasCost = gasUsed.mul(effectiveGasPrice);

                const currentFundmeBalance = await fundMe.provider.getBalance(fundMe.address);
                const currentDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Then assert what the functions are doing
                assert.equal(currentFundmeBalance, 0);
                assert.equal(
                    startingBalanceFundme.add(deployerStartingBalance).toString(),
                    currentDeployerBalance.add(gasCost).toString());
            });
            it("Should withdraw funds from multiple funders", async function () {
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++) {
                    //right now the fundme contract is connected to the deployer and so
                    //we have to call the fundme contract from different funders
                    const fundmeConnectedAccounts = await fundMe.connect(accounts[i]);
                    await fundmeConnectedAccounts.fund({ value: sentValue });
                }
                const startingBalanceFundme = await fundMe.provider.getBalance(fundMe.address);
                const deployerStartingBalance = await fundMe.provider.getBalance(deployer);

                //act
                const transactionResponse = await fundMe.withdraw();
                const transactionReciept = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReciept;

                const gasCost = gasUsed.mul(effectiveGasPrice);
                const currentFundmeBalance = await fundMe.provider.getBalance(fundMe.address);
                const currentDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Then assert what the functions are doing
                assert.equal(currentFundmeBalance, 0);
                assert.equal(
                    startingBalanceFundme.add(deployerStartingBalance).toString(),
                    currentDeployerBalance.add(gasCost).toString());
                //making sure that funders array resets

                await expect(fundMe.getFunderAt(0)).to.be.reverted;

                for (i = 0; i < 6; i++) {
                    await assert(fundMe.getaddressToAmmountFunded(accounts[i]), 0);
                }
            });
            it("Only the owner is able to withdraw", async function () {
                const accounts = await ethers.getSigners();
                const notOwner = accounts[1];
                const notOwnerConnectedContract = await fundMe.connect(notOwner);
                await expect(notOwnerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
            });

            it("Cheaper Withdraw Testing", async function () {
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++) {
                    //right now the fundme contract is connected to the deployer and so
                    //we have to call the fundme contract from different funders
                    const fundmeConnectedAccounts = await fundMe.connect(accounts[i]);
                    await fundmeConnectedAccounts.fund({ value: sentValue });
                }
                const startingBalanceFundme = await fundMe.provider.getBalance(fundMe.address);
                const deployerStartingBalance = await fundMe.provider.getBalance(deployer);

                //act
                const transactionResponse = await fundMe.withdrawButCheaper();
                const transactionReciept = await transactionResponse.wait(1);

                const { gasUsed, effectiveGasPrice } = transactionReciept;

                const gasCost = gasUsed.mul(effectiveGasPrice);
                const currentFundmeBalance = await fundMe.provider.getBalance(fundMe.address);
                const currentDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Then assert what the functions are doing
                assert.equal(currentFundmeBalance, 0);
                assert.equal(
                    startingBalanceFundme.add(deployerStartingBalance).toString(),
                    currentDeployerBalance.add(gasCost).toString());
                //making sure that getFunderAt array resets

                await expect(fundMe.getFunderAt(0)).to.be.reverted;

                for (i = 0; i < 6; i++) {
                    await assert(fundMe.getaddressToAmmountFunded(accounts[i]), 0);
                }
            });
        });
    });