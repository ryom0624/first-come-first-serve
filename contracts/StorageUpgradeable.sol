//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StorageUpgradeable is Initializable {
    uint public x;

    function initialize() public initializer {
        x = 42;
    }

    function changeStorage(uint256 _x) external returns(uint256) {
        x = _x;
        return x;
    }

    function upgradeFunc() external pure returns(uint256) {
        return 1;
    }

}
