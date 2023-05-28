const { run } = require("hardhat");
const verify = async function (contractAddress, args) {
    console.log("Verifying Contract Please Wait....");

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract Already Verified!");
        } else {
            console.log(error);
        }
    }
}

module.exports = { verify };