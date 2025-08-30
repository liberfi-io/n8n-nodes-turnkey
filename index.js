// This file ensures n8n can find and load your nodes and credentials
const { TurnkeyClient } = require('./dist/nodes/TurnkeyClient/TurnkeyClient.node.js');

module.exports = {
	nodeTypes: {
		turnkeyClient: TurnkeyClient,
	},
	credentialTypes: {
		turnkeyClientApi: require('./dist/credentials/TurnkeyClientApi.credentials.js').TurnkeyClientApi,
	},
};
