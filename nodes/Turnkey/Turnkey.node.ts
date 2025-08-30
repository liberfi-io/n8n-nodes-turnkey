import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { TurnkeyClient } from '@turnkey/http';
import { TStamper } from '@turnkey/http/dist/base';

export const commonFields: INodeProperties[] = [
	{
		displayName: 'Base URL',
		name: 'baseUrl',
		type: 'string',
		default: 'https://api.turnkey.com',
		required: true,
		description: 'Base URL of the Turnkey API',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create Wallet',
				value: 'createWallet',
				description: 'Create a wallet',
				action: 'Create a wallet',
			},
			{
				name: 'Create Wallet Accounts',
				value: 'createWalletAccounts',
				description: 'Create a wallet account',
				action: 'Create a wallet account',
			},
			{
				name: 'List Wallets',
				value: 'listWallets',
				description: 'Get a list of available wallets',
				action: 'List available wallets',
			},
			{
				name: 'Sign Transaction',
				value: 'signTransaction',
				description: 'Sign a transaction',
				action: 'Sign a transaction',
			},
			{
				name: 'Whoami',
				value: 'whoami',
				description: 'Get information about the current organization',
				action: 'Get information about the current organization',
			},
		],
		default: 'signTransaction',
		required: true,
	},
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string',
		placeholder: '',
		default: '',
		description: 'Organization ID of the Turnkey organization',
		required: true,
	},
];

export const signFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                product:create/update                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['signTransaction'],
			},
		},
		options: [
			{
				name: 'Ethereum',
				value: 'TRANSACTION_TYPE_ETHEREUM',
			},
			{
				name: 'Solana',
				value: 'TRANSACTION_TYPE_SOLANA',
			},
			{
				name: 'Tron',
				value: 'TRANSACTION_TYPE_TRON',
			},
		],
		default: 'TRANSACTION_TYPE_ETHEREUM',
		description: 'Type of transaction to sign',
		required: true,
	},
	{
		displayName: 'Unsigned Transaction',
		name: 'unsignedTransaction',
		type: 'string',
		placeholder: '',
		displayOptions: {
			show: {
				operation: ['signTransaction'],
			},
		},
		default: '',
		description:
			'Unsigned transaction to sign. For Ethereum transactions, provide hex format (starting with 0x). For Solana transactions, provide base64 format. For Tron transactions, provide hex format.',
		required: true,
	},
];

export const walletFields: INodeProperties[] = [
	{
		displayName: 'Wallet Name',
		name: 'walletName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the wallet to create',
		displayOptions: {
			show: {
				operation: ['createWallet'],
			},
		},
	},
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the wallet to create accounts for',
		displayOptions: {
			show: {
				operation: ['createWalletAccounts'],
			},
		},
	},
	{
		displayName: 'Accounts',
		name: 'accounts',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {
			values: [
				{
					curve: 'CURVE_SECP256K1',
					pathFormat: 'PATH_FORMAT_BIP32',
					path: '',
					addressFormat: 'ADDRESS_FORMAT_UNCOMPRESSED',
				},
			],
		},
		options: [
			{
				name: 'values',
				displayName: 'Account',
				values: [
					{
						displayName: 'Curve',
						name: 'curve',
						type: 'options',
						options: [
							{
								name: 'SECP256K1',
								value: 'CURVE_SECP256K1',
							},
							{
								name: 'ED25519',
								value: 'CURVE_ED25519',
							},
						],
						default: 'CURVE_SECP256K1',
					},
					{
						displayName: 'Path Format',
						name: 'pathFormat',
						type: 'options',
						options: [
							{
								name: 'BIP32',
								value: 'PATH_FORMAT_BIP32',
							},
						],
						default: 'PATH_FORMAT_BIP32',
					},
					{
						displayName: 'Path',
						name: 'path',
						type: 'string',
						default: '',
						required: true,
						description: 'Path to create the account for',
					},
					{
						displayName: 'Address Format',
						name: 'addressFormat',
						type: 'options',
						options: [
							{
								name: 'APTOS',
								value: 'ADDRESS_FORMAT_APTOS',
							},
							{
								name: 'Bitcoin Mainnet P2PKH',
								value: 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2PKH',
							},
							{
								name: 'Bitcoin Mainnet P2SH',
								value: 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2SH',
							},
							{
								name: 'Bitcoin Mainnet P2TR',
								value: 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2TR',
							},
							{
								name: 'Bitcoin Mainnet P2WPKH',
								value: 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WPKH',
							},
							{
								name: 'Bitcoin Mainnet P2WSH',
								value: 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WSH',
							},
							{
								name: 'Bitcoin Regtest P2PKH',
								value: 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2PKH',
							},
							{
								name: 'Bitcoin Regtest P2SH',
								value: 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2SH',
							},
							{
								name: 'Bitcoin Regtest P2TR',
								value: 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2TR',
							},
							{
								name: 'Bitcoin Regtest P2WPKH',
								value: 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2WPKH',
							},
							{
								name: 'Bitcoin Regtest P2WSH',
								value: 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2WSH',
							},
							{
								name: 'Bitcoin Signet P2PKH',
								value: 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2PKH',
							},
							{
								name: 'Bitcoin Signet P2SH',
								value: 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2SH',
							},
							{
								name: 'Bitcoin Signet P2TR',
								value: 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2TR',
							},
							{
								name: 'Bitcoin Signet P2WPKH',
								value: 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2WPKH',
							},
							{
								name: 'Bitcoin Signet P2WSH',
								value: 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2WSH',
							},
							{
								name: 'Bitcoin Testnet P2PKH',
								value: 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2PKH',
							},
							{
								name: 'Bitcoin Testnet P2SH',
								value: 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2SH',
							},
							{
								name: 'Bitcoin Testnet P2TR',
								value: 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2TR',
							},
							{
								name: 'Bitcoin Testnet P2WPKH',
								value: 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WPKH',
							},
							{
								name: 'Bitcoin Testnet P2WSH',
								value: 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WSH',
							},
							{
								name: 'Compressed',
								value: 'ADDRESS_FORMAT_COMPRESSED',
							},
							{
								name: 'Cosmos',
								value: 'ADDRESS_FORMAT_COSMOS',
							},
							{
								name: 'Doge Mainnet',
								value: 'ADDRESS_FORMAT_DOGE_MAINNET',
							},
							{
								name: 'Doge Testnet',
								value: 'ADDRESS_FORMAT_DOGE_TESTNET',
							},
							{
								name: 'Ethereum',
								value: 'ADDRESS_FORMAT_ETHEREUM',
							},
							{
								name: 'SEI',
								value: 'ADDRESS_FORMAT_SEI',
							},
							{
								name: 'Solana',
								value: 'ADDRESS_FORMAT_SOLANA',
							},
							{
								name: 'SUI',
								value: 'ADDRESS_FORMAT_SUI',
							},
							{
								name: 'Ton V3R2',
								value: 'ADDRESS_FORMAT_TON_V3R2',
							},
							{
								name: 'Ton V4R2',
								value: 'ADDRESS_FORMAT_TON_V4R2',
							},
							{
								name: 'Ton V5R1',
								value: 'ADDRESS_FORMAT_TON_V5R1',
							},
							{
								name: 'Tron',
								value: 'ADDRESS_FORMAT_TRON',
							},
							{
								name: 'Uncompressed',
								value: 'ADDRESS_FORMAT_UNCOMPRESSED',
							},
							{
								name: 'XLM',
								value: 'ADDRESS_FORMAT_XLM',
							},
							{
								name: 'XRP',
								value: 'ADDRESS_FORMAT_XRP',
							},
						],
						default: 'ADDRESS_FORMAT_UNCOMPRESSED',
					},
				],
			},
		],
		description: 'Accounts to create for the wallet',
		displayOptions: {
			show: {
				operation: ['createWallet', 'createWalletAccounts'],
			},
		},
	},
];

export class Turnkey implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Turnkey',
		name: 'turnkey',
		icon: 'file:turnkey.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Use Turnkey',
		defaults: {
			name: 'Turnkey',
		},
		// @ts-ignore - node-class-description-outputs-wrong
		inputs: [{ type: NodeConnectionType.Main }],
		// @ts-ignore - node-class-description-outputs-wrong
		outputs: [{ type: NodeConnectionType.Main }],
		usableAsTool: true,
		credentials: [
			{
				name: 'turnkeyApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
				],
				default: 'apiKey',
			},
			...commonFields, ...walletFields, ...signFields],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;

		let stamper: TStamper | undefined;

		let authentication = 'apiKey';
		try {
			authentication = this.getNodeParameter('authentication', 0) as string;
		} catch (error) {
			this.logger.debug('Authentication parameter not found, using default "apiKey" transport');
		}

		try {
			if (authentication === 'apiKey') {
				const apiKeyCredentials = await this.getCredentials('turnkeyApi');

				const { ApiKeyStamper } = await import('@turnkey/api-key-stamper');

				stamper = new ApiKeyStamper({
					apiPublicKey: apiKeyCredentials.apiPublicKey as string,
					apiPrivateKey: apiKeyCredentials.apiPrivateKey as string,
				});
			} else {
			}

			// Add error handling to transport
			if (!stamper) {
				throw new NodeOperationError(this.getNode(), 'No stamper available');
			}

			const client = new TurnkeyClient({ baseUrl }, stamper);

			const organizationId = this.getNodeParameter('organizationId', 0) as string;

			switch (operation) {
				case 'whoami': {
					const resp = await client.getWhoami({
						organizationId,
					});

					returnData.push({
						json: resp,
					});

					break;
				}
				case 'signTransaction': {
					const type = this.getNodeParameter('type', 0) as
						| 'TRANSACTION_TYPE_ETHEREUM'
						| 'TRANSACTION_TYPE_SOLANA'
						| 'TRANSACTION_TYPE_TRON';
					const signWith = this.getNodeParameter('signWith', 0) as string;
					const unsignedTransaction = this.getNodeParameter('unsignedTransaction', 0) as string;

					const resp = await client.signTransaction({
						type: 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2',
						timestampMs: Date.now().toString(),
						organizationId,
						parameters: {
							type, // "TRANSACTION_TYPE_ETHEREUM",
							signWith,
							unsignedTransaction,
						},
					});

					returnData.push({
						json: resp,
					});
					break;
				}
				case 'createWallet': {
					const walletName = this.getNodeParameter('walletName', 0) as string;

					const accounts = this.getNodeParameter('accounts', 0) as {
						curve: 'CURVE_SECP256K1' | 'CURVE_ED25519';
						pathFormat: 'PATH_FORMAT_BIP32';
						path: string;
						addressFormat:
							| 'ADDRESS_FORMAT_UNCOMPRESSED'
							| 'ADDRESS_FORMAT_COMPRESSED'
							| 'ADDRESS_FORMAT_ETHEREUM'
							| 'ADDRESS_FORMAT_SOLANA'
							| 'ADDRESS_FORMAT_COSMOS'
							| 'ADDRESS_FORMAT_TRON'
							| 'ADDRESS_FORMAT_SUI'
							| 'ADDRESS_FORMAT_APTOS'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2TR'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2TR'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2TR'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2TR'
							| 'ADDRESS_FORMAT_SEI'
							| 'ADDRESS_FORMAT_XLM'
							| 'ADDRESS_FORMAT_DOGE_MAINNET'
							| 'ADDRESS_FORMAT_DOGE_TESTNET'
							| 'ADDRESS_FORMAT_TON_V3R2'
							| 'ADDRESS_FORMAT_TON_V4R2'
							| 'ADDRESS_FORMAT_TON_V5R1'
							| 'ADDRESS_FORMAT_XRP';
					}[];

					const res = await client.createWallet({
						type: 'ACTIVITY_TYPE_CREATE_WALLET',
						timestampMs: Date.now().toString(),
						organizationId,
						parameters: {
							walletName,
							accounts,
						},
					});

					returnData.push({
						json: res,
					});
					break;
				}
				case 'createWalletAccounts': {
					const walletId = this.getNodeParameter('walletId', 0) as string;
					const accounts = this.getNodeParameter('accounts', 0) as {
						curve: 'CURVE_SECP256K1' | 'CURVE_ED25519';
						pathFormat: 'PATH_FORMAT_BIP32';
						path: string;
						addressFormat:
							| 'ADDRESS_FORMAT_UNCOMPRESSED'
							| 'ADDRESS_FORMAT_COMPRESSED'
							| 'ADDRESS_FORMAT_ETHEREUM'
							| 'ADDRESS_FORMAT_SOLANA'
							| 'ADDRESS_FORMAT_COSMOS'
							| 'ADDRESS_FORMAT_TRON'
							| 'ADDRESS_FORMAT_SUI'
							| 'ADDRESS_FORMAT_APTOS'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2TR'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2TR'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_SIGNET_P2TR'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2PKH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2SH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2WPKH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2WSH'
							| 'ADDRESS_FORMAT_BITCOIN_REGTEST_P2TR'
							| 'ADDRESS_FORMAT_SEI'
							| 'ADDRESS_FORMAT_XLM'
							| 'ADDRESS_FORMAT_DOGE_MAINNET'
							| 'ADDRESS_FORMAT_DOGE_TESTNET'
							| 'ADDRESS_FORMAT_TON_V3R2'
							| 'ADDRESS_FORMAT_TON_V4R2'
							| 'ADDRESS_FORMAT_TON_V5R1'
							| 'ADDRESS_FORMAT_XRP';
					}[];

					const res = await client.createWalletAccounts({
						type: 'ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS',
						timestampMs: Date.now().toString(),
						organizationId,
						parameters: {
							walletId,
							accounts,
						},
					});

					returnData.push({
						json: res,
					});

					break;
				}

				case 'listWallets': {
					const res = await client.getWallets({
						organizationId,
					});

					returnData.push({
						json: res,
					});

					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
			}

			return [returnData];
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to execute operation: ${(error as Error).message}`,
			);
		}
	}
}
