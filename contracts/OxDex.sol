// SPDX-License-Identifier: MIT

pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";

contract OxDex is ERC20Detailed, ERC20Capped(1e9 * 1e18) {
    constructor(string memory _name, string memory _symbol)
        public
        ERC20Detailed(_name, _symbol, 18)
    {}
}
