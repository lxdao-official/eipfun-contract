# Memory of Ethereum NFT Contract

This repository contains the smart contract implementation for the Memory of Ethereum NFT collection, built using Solidity and OpenZeppelin contracts.

OpenSea Collection: <https://opensea.io/collection/memory-of-ethereum>.

## Overview

The Memory of Ethereum contract is an ERC1155-based NFT contract that implements:
- Role-based access control
- NFT type management
- Minting controls
- Non-transferable NFTs
- URI management for metadata

## Contract Features

- **Role-Based Access Control**: Implements two roles:
  - `DEFAULT_ADMIN_ROLE`: Can update base URI and manage roles
  - `OPERATION_ROLE`: Can manage NFT types and minting operations

- **NFT Type Management**:
  - Add new NFT types
  - Remove unused NFT types
  - Control minting permissions per type
  - Track all available NFT types

- **Minting Controls**:
  - Individual minting with type verification
  - Bulk airdrop functionality
  - One NFT per type per address limit

- **Non-Transferable NFTs**:
  - NFTs cannot be transferred between addresses
  - Approval functions are disabled

## Adding New NFT Types for the coming ETH Upgrade

To add a new NFT type to the collection, follow these steps:

1. **Prepare Metadata**:
   - Create metadata JSON files for the new NFT type
   - Host metadata on IPFS or your preferred storage solution
   - Ensure the metadata follows the standard NFT metadata format

2. **Update Base URI**:
   ```solidity
   // Update the base URI to point to your metadata location
   updateBaseURI("https://your-metadata-base-uri/")
   ```

3. **Add New Type**:
   ```solidity
   // Call addType function with the new type identifier
   addType("newTypeIdentifier")
   ```

4. **Enable Minting**:
   ```solidity
   // Enable minting for the new type
   controlMint("newTypeIdentifier", true)
   ```

5. **Disable Minting**:
   ```solidity
   // Disable minting for the new type when mint window closed
   controlMint("newTypeIdentifier", false)
   ```

## Contract Management

### Adding New Types
- Only accounts with `OPERATION_ROLE` can add new types
- Each type gets a unique token ID
- Types cannot be duplicated

### Removing Types
- Only unused types (totalSupply = 0) can be removed
- Requires `OPERATION_ROLE`

### Minting Control
- Enable/disable minting for specific types
- One NFT per type per address limit
- Bulk airdrop capability for authorized accounts

## Development

### Prerequisites
- Node.js
- Yarn
- Hardhat

### Setup
1. Install dependencies:
   ```bash
   yarn install
   ```

2. Configure environment variables:
   - Create `.env` file
   - Add required environment variables

3. Compile contracts:
   ```bash
   yarn hardhat compile
   ```

### Testing
```bash
yarn hardhat test
```
