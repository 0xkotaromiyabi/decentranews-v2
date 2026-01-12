// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WriteNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from tokenId to content hash (immutable integrity check)
    mapping(uint256 => string) public contentHashes;
    
    // Mapping from tokenId to author address (for attribution even after transfer)
    mapping(uint256 => address) public authors;

    event ArticleMinted(uint256 indexed tokenId, address indexed author, string contentHash, string tokenURI);

    constructor(address initialOwner) ERC721("DecentraNews WriteNFT", "WRITE") Ownable(initialOwner) {}

    /**
     * @dev Mints a new WriteNFT.
     * @param to The recipient of the NFT (usually the author, but can be a DAO or other entity).
     * @param _tokenURI The Arweave URI containing the article content/metadata.
     * @param _contentHash The SHA-256 or IPFS hash of the raw text content for integrity verification.
     */
    function mintArticle(address to, string memory _tokenURI, string memory _contentHash) public returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        contentHashes[tokenId] = _contentHash;
        authors[tokenId] = to; // Valid assumption: minter/recipient is the author logic handled by backend

        emit ArticleMinted(tokenId, to, _contentHash, _tokenURI);

        return tokenId;
    }

    /**
     * @dev Returns the total number of articles minted.
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}
