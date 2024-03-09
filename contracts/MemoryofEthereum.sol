// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MemoryofEthereum is ERC1155, ERC1155Supply, AccessControl {
    bytes32 public constant OPERATION_ROLE = keccak256("OPERATION_ROLE");
    using Strings for uint256;

    string public baseURI;
    uint256 private _tokenIdCounter = 1;

    mapping(uint256 => string) private _tokenIdTypes;
    mapping(string => uint256) private _typeTokenIds;
    string[] private _types;

    mapping(uint256 => bool) _tokenIdMintAllowed;

    struct MemberTypeAmounts {
        string[] types;
        uint256[] amounts;
    }

    event TypeAdded(address operator, string newType);
    event TypeRemoved(address operator, string removedType);
    event BaseURIChanged(
        address operator,
        string fromBaseURI,
        string toBaseURI
    );

    constructor(string memory _baseURI) ERC1155(_baseURI) {
        baseURI = _baseURI;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATION_ROLE, msg.sender);
    }

    function updateBaseURI(
        string calldata _newBaseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit BaseURIChanged(msg.sender, baseURI, _newBaseURI);
        baseURI = _newBaseURI;
    }

    function addType(string memory nftType) public onlyRole(OPERATION_ROLE) {
        require(_typeTokenIds[nftType] == 0, "Type already exists");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdTypes[tokenId] = nftType;
        _typeTokenIds[nftType] = tokenId;
        _types.push(nftType);

        _tokenIdMintAllowed[tokenId] = false;

        _tokenIdCounter += 1;

        emit TypeAdded(msg.sender, nftType);
    }

    function removeType(string memory nftType) public onlyRole(OPERATION_ROLE) {
        uint256 tokenId = _typeTokenIds[nftType];

        require(tokenId != 0, "Type does not exists");
        require(
            totalSupply(tokenId) == 0,
            "The type is already in use by users."
        );

        delete _tokenIdTypes[tokenId];
        delete _typeTokenIds[nftType];

        for (uint256 i = 0; i < _types.length; i++) {
            if (
                keccak256(abi.encodePacked(_types[i])) ==
                keccak256(abi.encodePacked(nftType))
            ) {
                if (i == _types.length - 1) {
                    _types.pop();
                } else {
                    _types[i] = _types[_types.length - 1];
                    _types.pop();
                }
                break;
            }
        }

        emit TypeRemoved(msg.sender, nftType);
    }

    function getAllTypes() public view returns (string[] memory) {
        return _types;
    }

    function getTokenId(string calldata nftType) public view returns (uint256) {
        return _typeTokenIds[nftType];
    }

    function controlMint(
        string memory nftType,
        bool allow
    ) public onlyRole(OPERATION_ROLE) {
        uint256 tokenId = _typeTokenIds[nftType];
        require(tokenId != 0, "The type does not exist");

        if (allow == true) {
            require(
                _tokenIdMintAllowed[tokenId] == false,
                "Minting of this NFT is allowed."
            );
        } else {
            require(
                _tokenIdMintAllowed[tokenId] == true,
                "Minting of this NFT is not allowed."
            );
        }
        _tokenIdMintAllowed[tokenId] = allow;
    }

    function mint(string calldata nftType) external {
        uint256 tokenId = _typeTokenIds[nftType];
        require(tokenId != 0, "The type does not exist");
        require(
            _tokenIdMintAllowed[tokenId] == true,
            "Minting of this NFT is not allowed."
        );
        require(
            balanceOf(_msgSender(), tokenId) < 1,
            "You have owned the NFT."
        );

        _mint(_msgSender(), tokenId, 1, "");
    }

    function mintAndAirdrop(
        string calldata nftType,
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyRole(OPERATION_ROLE) {
        uint256 tokenId = _typeTokenIds[nftType];
        require(tokenId != 0, "The type does not exist");
        require(
            users.length == amounts.length,
            "Users and amounts length not equal"
        );

        for (uint256 i = 0; i < users.length; i++) {
            _mint(users[i], tokenId, amounts[i], "");
        }
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function setApprovalForAll(address, bool) public virtual override(ERC1155) {
        revert("Cannot setApprovalForAll.");
    }

    function isApprovedForAll(
        address,
        address
    ) public view virtual override(ERC1155) returns (bool) {
        return false;
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override(ERC1155) {
        revert("Cannot safeTransferFrom.");
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override(ERC1155) {
        revert("Cannot safeBatchTransferFrom.");
    }

    function uri(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return string(abi.encodePacked(baseURI, _tokenIdTypes[tokenId]));
    }
}
