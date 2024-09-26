
export const verifyDssAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_aggregator",
				"type": "address"
			},
			{
				"internalType": "contract ICore",
				"name": "_core",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposer",
				"type": "uint256"
			}
		],
		"name": "IsValidAndProposer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "msgFromContract",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposer",
				"type": "uint256"
			}
		],
		"name": "Received",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "txnHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"name": "TxnVerificationResult",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "aggregator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "cancelSlashingHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "vault",
				"type": "address"
			}
		],
		"name": "cancelUpdateStakeHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "core",
		"outputs": [
			{
				"internalType": "contract ICore",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "emitStoredIsValidAndProposer",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "finishSlashingHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "finishUpdateStakeHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isOperatorRegistered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "slashablePercentage",
				"type": "uint256"
			}
		],
		"name": "registerToCore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "extraData",
				"type": "bytes"
			}
		],
		"name": "registrationHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "slashingPercentagesWad",
				"type": "uint256[]"
			}
		],
		"name": "requestSlashingHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"components": [
					{
						"internalType": "address",
						"name": "vault",
						"type": "address"
					},
					{
						"internalType": "contract IDSS",
						"name": "dss",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "toStake",
						"type": "bool"
					}
				],
				"internalType": "struct Operator.StakeUpdateRequest",
				"name": "newStake",
				"type": "tuple"
			}
		],
		"name": "requestUpdateStakeHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceID",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "extraData",
				"type": "bytes"
			}
		],
		"name": "unregistrationHook",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposer",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_txnValid",
				"type": "bool"
			}
		],
		"name": "validateProposerTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "verifiedTxns",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "txnHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"name": "verifyTransaction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]