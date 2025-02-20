// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IDSS} from "./karak/src/interfaces/IDSS.sol";
import {ICore} from "./karak/src/interfaces/ICore.sol";
import {Operator} from "./karak/src/entities/Operator.sol";

contract TxnVerifier is IDSS {
    // Event to emit the verification result
    event TxnVerificationResult(bytes32 txnHash, uint256 blockNumber);
    
    event TaskResponseSubmitted(OperatorResponse taskResponse);
    
    // Store verified transactions
    mapping(bytes32 => uint256) public verifiedTxns;
      mapping(address operatorAddress => bool exists) operatorExists;
    
    mapping(bytes32 => bool) public taskCompleted;
    // Aggregator address
    address public aggregator;
    ICore core;
    

    struct OperatorResponse {
        bool is_included;
        uint64 proposer_index;
        string block_number;    
    }
    

    struct Task {
        string transaction_hash;
        string block_number;
    }
    
    // State variables to store txnValid and proposer
    bool private txnValid;
    uint256 private proposer;
    
    // Added missing mapping
    mapping(bytes32 => OperatorResponse) public taskResponses;
    
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
    ) public {
        // Simulate verification logic here (placeholder)
        verifiedTxns[txnHash] = blockNumber;
        
        // Emit the verification result
        emit TxnVerificationResult(txnHash, blockNumber);
    }
    
    function submitTaskResponse(string calldata taskRequest, OperatorResponse calldata taskResponse)   
        external
        onlyAggregator
    {
        bytes32 taskRequestHash = keccak256(abi.encode(taskRequest));  
        taskCompleted[taskRequestHash] = true;
        taskResponses[taskRequestHash] = taskResponse;
        emit TaskResponseSubmitted(taskResponse);
    }
 

    function getTaskResponseVerifiy(Task calldata taskRequest) external view returns (OperatorResponse memory) {
        bytes32 taskRequestHash = keccak256(abi.encode(taskRequest));
        return taskResponses[taskRequestHash];
    }

    function getTaskResponse(string calldata taskRequest) external view returns (OperatorResponse memory) {
        bytes32 taskRequestHash = keccak256(abi.encode(taskRequest));
        return taskResponses[taskRequestHash];
    }

      function isOperatorRegistered(address operator) external view returns (bool) {
        return operatorExists[operator];
    }

    
    /* ======= IDSS Interface Functions ======= */
    
    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return (interfaceID == IDSS.registrationHook.selector ||
            interfaceID == IDSS.unregistrationHook.selector);
    }
    
    function registerToCore(uint256 slashablePercentage) external {
        core.registerDSS(slashablePercentage);
    }
    
    function registrationHook(
        address operator,
        bytes memory extraData
    ) external {
        // Registration logic for operators
    }
    
    function unregistrationHook(
        address operator,
        bytes memory extraData
    ) external {
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