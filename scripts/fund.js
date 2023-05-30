const { ethers, getNamedAccounts } = require("hardhat");

async function main() {

    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log(`Grabbed Contract at ${fundMe.address}`);
    console.log("deploying pls wait....")

    const transactionResponse = await fundMe.fund({ value: ethers.utils.parseEther("0.026") });
    await transactionResponse.wait(1);
    console.log("Contract Successfully funded");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })