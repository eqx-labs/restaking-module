export const verifyDssAbi = [
	{
	  type: 'constructor',
	  inputs: [
		{ name: '_aggregator', type: 'address', internalType: 'address' },
		{ name: '_core', type: 'address', internalType: 'contract ICore' },
	  ],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'event',
	  name: 'Received',
	  inputs: [
		{ name: 'msgFromContract', type: 'bool', internalType: 'bool', indexed: false },
		{ name: 'proposer', type: 'uint256', internalType: 'uint256', indexed: false },
	  ],
	  anonymous: false,
	},
	{
	  type: 'event',
	  name: 'TxnVerificationResult',
	  inputs: [
		{ name: 'txnHash', type: 'bytes32', internalType: 'bytes32', indexed: false },
		{ name: 'blockNumber', type: 'uint256', internalType: 'uint256', indexed: false },
	  ],
	  anonymous: false,
	},
	{
	  type: 'function',
	  name: 'aggregator',
	  inputs: [],
	  outputs: [{ name: '', type: 'address', internalType: 'address' }],
	  stateMutability: 'view',
	},
	{
	  type: 'function',
	  name: 'cancelSlashingHook',
	  inputs: [{ name: 'operator', type: 'address', internalType: 'address' }],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'cancelUpdateStakeHook',
	  inputs: [
		{ name: 'operator', type: 'address', internalType: 'address' },
		{ name: 'vault', type: 'address', internalType: 'address' },
	  ],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'finishSlashingHook',
	  inputs: [{ name: 'operator', type: 'address', internalType: 'address' }],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'finishUpdateStakeHook',
	  inputs: [{ name: 'operator', type: 'address', internalType: 'address' }],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'registerToCore',
	  inputs: [{ name: 'slashablePercentage', type: 'uint256', internalType: 'uint256' }],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'registrationHook',
	  inputs: [
		{ name: 'operator', type: 'address', internalType: 'address' },
		{ name: 'extraData', type: 'bytes', internalType: 'bytes' },
	  ],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'requestSlashingHook',
	  inputs: [
		{ name: 'operator', type: 'address', internalType: 'address' },
		{ name: 'slashingPercentagesWad', type: 'uint256[]', internalType: 'uint256[]' },
	  ],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'function',
	  name: 'requestUpdateStakeHook',
	  inputs: [
		{ name: 'operator', type: 'address', internalType: 'address' },
		{
		  name: 'newStake',
		  type: 'tuple',
		  internalType: 'struct Operator.StakeUpdateRequest',
		  components: [
			{ name: 'vault', type: 'address', internalType: 'address' },
			{ name: 'dss', type: 'address', internalType: 'contract IDSS' },
			{ name: 'toStake', type: 'bool', internalType: 'bool' },
		  ],
		},
	  ],
	  outputs: [],
	  stateMutability: 'nonpayable',
	},
	{
	  type: 'error',
	  name: 'NotAggregator',
	  inputs: [],
	},
	{
	  type: 'error',
	  name: 'OperatorAlreadyRegistered',
	  inputs: [],
	},
	{
	  type: 'error',
	  name: 'OperatorAndIndexDontMatch',
	  inputs: [],
	},
	{
	  type: 'error',
	  name: 'OperatorIsNotRegistered',
	  inputs: [],
	},
	{
	  type: 'error',
	  name: 'SenderNotOperator',
	  inputs: [],
	},
	{
	  type: 'error',
	  name: 'TaskAlreadyExists',
	  inputs: [],
	},
  ];
  