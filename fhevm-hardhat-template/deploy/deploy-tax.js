const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FHE_TaxDeclaration to Sepolia...");

  const ContractFactory = await ethers.getContractFactory("FHE_TaxDeclaration");
  const contract = await ContractFactory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("FHE_TaxDeclaration deployed to:", address);
  console.log("View on Sepolia:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
