import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { TurnkeyClient } from "@turnkey/http";
import { TStamper } from '@turnkey/http/dist/base';



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
				required: false,
				displayOptions: {
					show: {
						authType: ['apikey'],
					},
				},
			},
		],
		properties: [
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
						name: 'Sign Transaction',
						value: 'signTransaction',
						description: 'Sign a transaction',
						action: 'Sign a transaction',
					},
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
				],
				default: 'signTransaction',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;

		let stamper: TStamper | undefined;
		
		let authType = 'apikey';
		try {
			authType = this.getNodeParameter('authType', 0) as string;
		} catch (error) {
			this.logger.debug('AuthType parameter not found, using default "apikey" transport');
		}

		try {
			if (authType === 'apikey') {
				const apiKeyCredentials = await this.getCredentials('turnkeyApi');

				const { ApiKeyStamper } = await import("@turnkey/api-key-stamper");

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

			const client = new TurnkeyClient(
				{ baseUrl },
				stamper,
			);

			switch (operation) {
				case 'signTransaction': {
					const organizationId = this.getNodeParameter('organizationId', 0) as string;
					const type = this.getNodeParameter('type', 0) as "TRANSACTION_TYPE_ETHEREUM" | "TRANSACTION_TYPE_SOLANA" | "TRANSACTION_TYPE_TRON";
					const unsignedTransaction = this.getNodeParameter('unsignedTransaction', 0) as string;
					
					const resp = await client.signTransaction({
						type: "ACTIVITY_TYPE_SIGN_TRANSACTION_V2",
						timestampMs: Date.now().toString(),
						organizationId,
						parameters: {
							type, // "TRANSACTION_TYPE_ETHEREUM",
							signWith: "0x123",
							unsignedTransaction,
						},
					});

					returnData.push({
						json: resp,
					});
					break;
				}
				case 'createWallet': {
					const organizationId = this.getNodeParameter('organizationId', 0) as string;
					const walletName = this.getNodeParameter('walletName', 0) as string;

					const accounts = this.getNodeParameter('accounts', 0) as {
						curve: "CURVE_SECP256K1" | "CURVE_ED25519" ;
						pathFormat: "PATH_FORMAT_BIP32";
						path: string;
						addressFormat: "ADDRESS_FORMAT_UNCOMPRESSED" | "ADDRESS_FORMAT_COMPRESSED";
					}[];

					const res = await client.createWallet({
						type: "ACTIVITY_TYPE_CREATE_WALLET",
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
					const organizationId = this.getNodeParameter('organizationId', 0) as string;
					const walletId = this.getNodeParameter('walletId', 0) as string;
					const accounts = this.getNodeParameter('accounts', 0) as {
						curve: "CURVE_SECP256K1" | "CURVE_ED25519";
						pathFormat: "PATH_FORMAT_BIP32";
						path: string;
						addressFormat: "ADDRESS_FORMAT_UNCOMPRESSED" | "ADDRESS_FORMAT_COMPRESSED";
					}[];
				
					const res = await client.createWalletAccounts({
						type: "ACTIVITY_TYPE_CREATE_WALLET_ACCOUNTS",
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

				case "getWallets": {
					const organizationId = this.getNodeParameter('organizationId', 0) as string;
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
