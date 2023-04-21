const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");

// =============================================================================

const storage = Object.create({});

function getStage({ from }) {
	if (!storage[from]) {
		storage[from] = {
			stage: 0,
			tree: 0,
		};
	}

	return storage[from].stage;
}

const stages = [
	{
		label: "Start",
		exec({ from }) {
			storage[from].stage = 1;
			return "Olá, escolha uma opção:\n1 - Op 1\n2 - Op 2\n3 - Op 3";
		},
	},
];

// =============================================================================

const client = new Client({
	// instace Client and set auth strategy
	authStrategy: new LocalAuth(),
});

client.on("qr", (code) => {
	// on client generate QR Code display in terminal
	qrCode.generate(code, { small: true });
});
client.on("ready", () => {
	console.log("Whatsapp is ready.");
});

client.on("message", (message) => {
	const currentStage = getStage({ from: message.from });

	const messageResponse = stages[currentStage].exec({
		from: message.from,
	});

	if (messageResponse) {
		client.sendMessage(message.from, messageResponse);
	}
});

client.initialize();
