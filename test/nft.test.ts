import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("DAOMember Test", function () {
  const baseURI = "https://api-dev.lxdao.io/buidler/badge/metadata/";

  const NFT_A = "DencunNFT";
  const NFT_B = "ShangHaiNFT";
  const NFT_C = "LondonNFT";

  async function deployDAOMemberFixture() {
    const [owner, operator, user1, user2] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("EIPFunNFT");
    const EIPFunNFT = await factory.deploy(baseURI);

    return {
      EIPFunNFT,
      owner,
      user1,
      user2,
      operator,
    };
  }

  it("#1 - add type", async function () {
    const { EIPFunNFT, owner, operator, user1 } = await loadFixture(
      deployDAOMemberFixture
    );

    const role = await EIPFunNFT.DEFAULT_ADMIN_ROLE();

    // grant
    await EIPFunNFT.connect(owner).grantRole(role, user1.address);

    // revoke
    await EIPFunNFT.connect(owner).revokeRole(
      await EIPFunNFT.DEFAULT_ADMIN_ROLE(),
      user1.address
    );

    await EIPFunNFT.connect(owner).grantRole(
      await EIPFunNFT.OPERATION_ROLE(),
      operator.address
    );

    // add badgeA
    await EIPFunNFT.connect(operator).addType(NFT_A);

    let tokenId = await EIPFunNFT.getTokenId(NFT_A);
    expect(tokenId.toNumber()).to.be.greaterThan(0);

    let types = await EIPFunNFT.getAllTypes();
    expect(types.length).to.equal(1);
  });

  it("#2 - remove type", async function () {
    const { EIPFunNFT, owner, user1, operator } = await loadFixture(
      deployDAOMemberFixture
    );

    // grant
    await EIPFunNFT.connect(owner).grantRole(
      await EIPFunNFT.OPERATION_ROLE(),
      operator.address
    );

    // add NFT_A
    await EIPFunNFT.connect(operator).addType(NFT_A);

    await EIPFunNFT.connect(operator).mintAndAirdrop(
      NFT_A,
      [user1.address],
      [1]
    );

    await expect(EIPFunNFT.connect(operator).removeType(NFT_A)).revertedWith(
      "The type is already in use by users."
    );

    // add NFT_B
    await EIPFunNFT.connect(operator).addType(NFT_B);

    let types = await EIPFunNFT.getAllTypes();
    expect(types.length).to.equal(2);

    // add NFT_C
    await EIPFunNFT.connect(operator).addType(NFT_C);

    // remove
    await EIPFunNFT.connect(operator).removeType(NFT_B);
    const badgeBTokenId = await EIPFunNFT.getTokenId(NFT_B);
    expect(badgeBTokenId.toNumber()).to.equal(0);

    types = await EIPFunNFT.getAllTypes();
    expect(types[0]).to.equal(NFT_A);
    expect(types[1]).to.equal(NFT_C);
  });

  it("#2 - mint and airdrop", async function () {
    const { EIPFunNFT, owner, operator, user1, user2 } = await loadFixture(
      deployDAOMemberFixture
    );

    await EIPFunNFT.connect(owner).grantRole(
      await EIPFunNFT.OPERATION_ROLE(),
      operator.address
    );

    await EIPFunNFT.connect(operator).addType(NFT_A);
    await EIPFunNFT.connect(operator).addType(NFT_B);

    // mint
    await expect(EIPFunNFT.connect(user1).mint(NFT_A)).revertedWith(
      "Minting of this NFT is not allowed."
    );

    await EIPFunNFT.connect(operator).controlMint(NFT_A, true);
    await EIPFunNFT.connect(operator).controlMint(NFT_B, true);

    await EIPFunNFT.connect(user1).mint(NFT_A);
    await EIPFunNFT.connect(user2).mint(NFT_B);

    // airdrop
    await EIPFunNFT.connect(operator).mintAndAirdrop(
      NFT_B,
      [user1.address, user2.address],
      [1, 2]
    );

    // approval
    await expect(
      EIPFunNFT.connect(user1).setApprovalForAll(user2.address, true)
    ).revertedWith("Cannot setApprovalForAll.");

    // transfer
    let tokenId = await EIPFunNFT.getTokenId(NFT_A);
    await expect(
      EIPFunNFT.connect(user1).safeTransferFrom(
        user1.address,
        user2.address,
        tokenId,
        1,
        Buffer.from("")
      )
    ).revertedWith("Cannot safeTransferFrom.");
    await expect(
      EIPFunNFT.connect(user1).safeBatchTransferFrom(
        user1.address,
        user2.address,
        [tokenId],
        [1],
        Buffer.from("")
      )
    ).revertedWith("Cannot safeBatchTransferFrom.");
  });
});
