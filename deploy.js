const hre = require("hardhat");

async function main() {
    const Database = await hre.ethers.getContractFactory("Database");
    const database = await Database.deploy();
    await database.waitForDeployment();
    console.log("Database contract deployed at:", await database.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
