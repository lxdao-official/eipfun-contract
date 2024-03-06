import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("DAOMember Test", function () {
    const baseURI = "https://api-dev.lxdao.io/buidler/badge/metadata/";

    const NFT_A = "DencunNFT";
    const NF_B = "ShangHaiNFT";
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
        const { EIPFunNFT, owner, operator , user1} = await loadFixture(
            deployDAOMemberFixture,
        );

        // grant
        await EIPFunNFT.connect(owner).grantRole(
            await EIPFunNFT.DEFAULT_ADMIN_ROLE(),
            user1.address,
        );

        // revoke
        await EIPFunNFT.connect(user1).revokeRole(
            await EIPFunNFT.DEFAULT_ADMIN_ROLE(),
            owner.address,
        );

        await EIPFunNFT.connect(owner).grantRole(
            await EIPFunNFT.OPERATION_ROLE(),
            operator.address,
        );

        // add badgeA
        await EIPFunNFT.connect(operator).addType(NFT_A);

        // let tokenId = await EIPFunNFT.getTokenId(NFT_A);
        // expect(tokenId.toNumber()).to.be.greaterThan(0);

        let types = await EIPFunNFT.getAllTypes();
        expect(types.length).to.equal(1);
    });
});
