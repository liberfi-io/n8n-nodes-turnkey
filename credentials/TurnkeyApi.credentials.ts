import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class TurnkeyApi implements ICredentialType {
	name = 'turnkeyApi';
	displayName = 'Turnkey API';

	// Cast the icon to the correct type for n8n
	icon = 'file:turnkey.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.turnkey.com',
			required: true,
			description: 'Base URL of the Turnkey API',
		},	
		{
			displayName: 'Api Public Key',
			name: 'apiPublicKey',
			type: 'string',
			default: '',
			typeOptions: { password: true },
			description: 'Api Public Key of the Turnkey API',
		},
		{
			displayName: 'Api Private Key',
			name: 'apiPrivateKey',
			type: 'string',
			default: '',
			typeOptions: { password: true },
			description: 'Api Private Key of the Turnkey API',
		},
	];
}
