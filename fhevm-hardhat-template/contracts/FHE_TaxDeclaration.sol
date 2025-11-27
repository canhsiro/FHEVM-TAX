// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";

/// @title Khai báo thuế - Dữ liệu được mã hóa FHE
contract FHE_TaxDeclaration {
    mapping(address => euint32) private declarations;

    event Declared(address indexed user);

    /// @notice Khai báo số tiền (đã mã hóa)
    function declare(externalEuint32 input, bytes calldata proof) external {
        euint32 amount = FHE.fromExternal(input, proof);
        declarations[msg.sender] = amount;
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
        emit Declared(msg.sender);
    }

    /// @notice Lấy dữ liệu đã mã hóa (chỉ người dùng giải mã được)
    function getDeclaration() external view returns (euint32) {
        return declarations[msg.sender];
    }
}
