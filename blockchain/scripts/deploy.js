const hre = require("hardhat");

async function main() {
    const [deployer, investor1, insurer, investor3, investor4] = await hre.ethers.getSigners();

    console.log("Deploying with:", deployer.address);

    //Deploying MockRWFC
    const MockRWFC = await hre.ethers.getContractFactory("MockRWFC");
    const mockRWFC = await MockRWFC.deploy();
    await mockRWFC.waitForDeployment();

    //Deploying PremiumPool
    const PremiumPool = await hre.ethers.getContractFactory("PremiumPool");
    const premiumPool = await PremiumPool.deploy(await mockRWFC.getAddress());
    await premiumPool.waitForDeployment();

    //Deploying PolicyRegistry
    const PolicyRegistry = await hre.ethers.getContractFactory("PolicyRegistry");
    const policyRegistry = await PolicyRegistry.deploy(await mockRWFC.getAddress());
    await policyRegistry.waitForDeployment();

    //Deploying TriggerOracle
    const TriggerOracle = await hre.ethers.getContractFactory("TriggerOracle");
    const triggerOracle = await TriggerOracle.deploy(
        await policyRegistry.getAddress(),
        await premiumPool.getAddress()
    );
    await triggerOracle.waitForDeployment();

    //We HAVE to link the contracts to insure interoperability
    console.log("Linking contracts...");
    await (await premiumPool.linkPolicyRegistry(await policyRegistry.getAddress())).wait();
    await (await policyRegistry.setPremiumPool(await premiumPool.getAddress())).wait();

    // Grant ORACLE_ROLE to deployer and insurer
    const ORACLE_ROLE = await premiumPool.ORACLE_ROLE();
    await (await premiumPool.grantRole(ORACLE_ROLE, deployer.address)).wait();
    await (await premiumPool.grantRole(ORACLE_ROLE, insurer.address)).wait();
    console.log("Granted ORACLE_ROLE to deployer and insurer");

    // Grant ADMIN_ROLE to insurer as well (so they can mark paid out)
    const ADMIN_ROLE = await policyRegistry.ADMIN_ROLE();
    await (await policyRegistry.grantRole(ADMIN_ROLE, insurer.address)).wait();
    console.log("Granted ADMIN_ROLE to insurer");

    //Minting test RWFC:
    const amountInvestor = hre.ethers.parseUnits("5000", 18);
    const amountInsurer = hre.ethers.parseUnits("10000000", 18);
    await (await mockRWFC.mint(deployer.address, amountInvestor)).wait();
    await (await mockRWFC.mint(investor1.address, amountInvestor)).wait();
    await (await mockRWFC.mint(insurer.address, amountInsurer)).wait();
    await (await mockRWFC.mint(investor3.address, amountInvestor)).wait();
    await (await mockRWFC.mint(investor4.address, amountInvestor)).wait();
    console.log("Minted 5000 RWFC to deployer, investor1, investor3, investor4; 10,000,000 to insurer");

    //Fund the PremiumPool with 5,000,000 RWFC from the insurer
    const fundAmount = hre.ethers.parseUnits("5000000", 18);
    await (await mockRWFC.connect(insurer).transfer(await premiumPool.getAddress(), fundAmount)).wait();
    console.log("Funded PremiumPool with 5,000,000 RWFC from insurer");

    //PRINT OUT THE CONTRACT ADDRESSES NEEDED
    console.log("MockRWFC:", await mockRWFC.getAddress());
    console.log("PremiumPool:", await premiumPool.getAddress());
    console.log("PolicyRegistry:", await policyRegistry.getAddress());
    console.log("TriggerOracle:", await triggerOracle.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});