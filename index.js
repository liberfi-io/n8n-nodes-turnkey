// This file ensures n8n can find and load your nodes and credentials
const { Turnkey } = require('./dist/nodes/Turnkey/Turnkey.node.js');

module.exports = {
	nodeTypes: {
		turnkey: Turnkey,
	},
	credentialTypes: {
		turnkeyApi: require('./dist/credentials/TurnkeyApi.credentials.js').TurnkeyApi,
	},
};
