// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IDSS} from "./karak/src/interfaces/IDSS.sol";
import {ICore} from "./karak/src/interfaces/ICore.sol";
import {Operator} from "./karak/src/entities/Operator.sol";

contract TxnVerifier is IDSS {
    // Event to emit the verification result
    event TxnVerificationResult(bytes32 txnHash, uint256 blockNumber);
    event Received(bool msgFromContract, uint256 proposer);
    event IsValidAndProposer(bool isValid, uint256 proposer);

    // Store verified transactions
    mapping(bytes32 => uint256) public verifiedTxns;
      mapping(address operatorAddress => bool exists) operatorExists;

    // Aggregator address
    address public aggregator;
    ICore public core;

    // State variables to store txnValid and proposer
    bool private txnValid;
    uint256 private proposer;

    /* ======= Modifiers ======= */
    modifier onlyAggregator() {
        require(msg.sender == aggregator, "Not Aggregator");
        _;
    }

    constructor(address _aggregator, ICore _core) {
        aggregator = _aggregator;
        core = _core;
    }

    /* ======= External Functions ======= */

    // Function to verify transaction inclusion
    function verifyTransaction(
        bytes32 txnHash,
        uint256 blockNumber
    ) external onlyAggregator {
        // Simulate verification logic here (placeholder)
        verifiedTxns[txnHash] = blockNumber;

        // Emit the verification result
        emit TxnVerificationResult(txnHash, blockNumber);
    }

    // Function to validate proposer transaction
    function validateProposerTransaction(
        uint256 _proposer,
        bool _txnValid
    ) external onlyAggregator {
        // Emit the result
        emit Received(_txnValid, _proposer);
        
        // Store the values in state variables
        txnValid = _txnValid;
        proposer = _proposer;

        // Emit the new event with the stored values
        emit IsValidAndProposer(txnValid, proposer);
    }

    // New function to emit stored isValid and proposer
    function emitStoredIsValidAndProposer() external view returns (uint256) {
        // Check if the transaction is valid
        if (txnValid) {
            // If valid, return the proposer without emitting the event
            return proposer;
        } else {
            return 0; // Optionally return 0 or another default value when txnValid is false
        }
    }

    /* ======= IDSS Interface Functions ======= */

  


    function isOperatorRegistered(address operator) external view returns (bool) {
        return operatorExists[operator];
    }



    function supportsInterface(
        bytes4 interfaceID
    ) external pure override returns (bool) {
        return (interfaceID == IDSS.registrationHook.selector ||
            interfaceID == IDSS.unregistrationHook.selector);
    }

    function registerToCore(uint256 slashablePercentage) external {
        core.registerDSS(slashablePercentage);
    }

    function registrationHook(
        address operator,
        bytes memory extraData
    ) external override {
        // Registration logic for operators
    }

    function unregistrationHook(
        address operator,
        bytes memory extraData
    ) external override {
        // Unregistration logic for operators
    }

    function requestUpdateStakeHook(
        address operator,
        Operator.StakeUpdateRequest memory newStake
    ) external override {}

    function cancelUpdateStakeHook(
        address operator,
        address vault
    ) external override {}

    function finishUpdateStakeHook(address operator) external override {}

    function requestSlashingHook(
        address operator,
        uint256[] memory slashingPercentagesWad
    ) external override {}

    function cancelSlashingHook(address operator) external override {}

    function finishSlashingHook(address operator) external override {}
}
