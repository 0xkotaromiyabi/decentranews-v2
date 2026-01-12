// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/IERC6551Registry.sol";

contract TBAManager {
    IERC6551Registry public immutable registry;
    address public immutable accountImplementation;

    constructor(address _registry, address _implementation) {
        registry = IERC6551Registry(_registry);
        accountImplementation = _implementation;
    }

    /**
     * @dev Creates a TBA for a given token if it doesn't exist.
     * Use a fixed salt (0) for simplicity.
     */
    function createAccount(address tokenContract, uint256 tokenId) external returns (address) {
        return registry.createAccount(
            accountImplementation,
            bytes32(0),
            block.chainid,
            tokenContract,
            tokenId
        );
    }

    /**
     * @dev Computes the TBA address for a given token.
     */
    function getAccount(address tokenContract, uint256 tokenId) external view returns (address) {
        return registry.account(
            accountImplementation,
            bytes32(0),
            block.chainid,
            tokenContract,
            tokenId
        );
    }
}
