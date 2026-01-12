// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ERC6551AccountLib {
    function token()
        internal
        view
        returns (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        )
    {
        uint256 length = address(this).code.length;
        return token(length);
    }

    function token(uint256 length)
        internal
        view
        returns (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        )
    {
        uint256 extraLength = length - 0x2d; // ERC-1167 footer length
        // Standard ERC-6551 footer length is 0x60 (96 bytes)
        // chainId (32) + tokenContract (32) + tokenId (32)
        // The implementation assumes the appended data follows the ERC-6551 standard layout
        
        assembly {
            // copy 32 bytes from code at offset (length - 96) to memory at 0x0
            extcodecopy(address(), 0, sub(length, 0x60), 0x20)
            chainId := mload(0)
            
            // copy 32 bytes from code at offset (length - 64) to memory at 0x0
            extcodecopy(address(), 0, sub(length, 0x40), 0x20)
            tokenContract := mload(0)
            
            // copy 32 bytes from code at offset (length - 32) to memory at 0x0
            extcodecopy(address(), 0, sub(length, 0x20), 0x20)
            tokenId := mload(0)
        }
    }
}
