const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910",
    },
}

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITAL_ANSWER,
}