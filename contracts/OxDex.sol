// SPDX-License-Identifier: MIT

pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";

contract OxDex is ERC20Detailed("OXDEX", "OX", 18), ERC20Capped(1e9 * 1e18) {
    constructor() public {}
}
