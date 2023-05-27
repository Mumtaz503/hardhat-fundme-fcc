const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const deployer = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(chainId)) {
        log("Local Chain detected. Deploying Mocks...");
        const mockAggregator = await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITAL_ANSWER],
        });
        log("Mocks Deployed!");
        log("---------------------------------------------------------");

        // You can perform additional deployment tasks here if needed
    }
};

module.exports.tags = ["all", "mocks"];
