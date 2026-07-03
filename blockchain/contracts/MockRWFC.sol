// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockRWFC is ERC20, Ownable {
    constructor() ERC20("MockRWFC", "mRWFC") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        //minting my own mini-emulated Rwanda e-franc
        _mint(to, amount);
    }
}