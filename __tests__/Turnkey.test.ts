import { Turnkey } from '../nodes/Turnkey/Turnkey.node';

describe('Turnkey Node', () => {
	let turnkey: Turnkey;

	beforeEach(() => {
		turnkey = new Turnkey();
	});

	it('should have the correct node type', () => {
		expect(turnkey.description.name).toBe('turnkey');
	});

	it('should have properties defined', () => {
		expect(turnkey.description.properties).toBeDefined();
	});
});
