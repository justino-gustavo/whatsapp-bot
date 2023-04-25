const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");

// =============================================================================

const useStorage = require("./utils/storage");

// =============================================================================

const stages = [
	{
		id: "Iz1ai1dee",
		message: {
			body: "Olá",
			options: [
				{
					label: "oi",
					link: "dee1mooCh",
				},
				{
					label: "again",
					link: "dee1mooCh",
				},
			],
		},
		exec() {
			console.log("olá");
		},
		entryPoint: true,
	},
	{
		id: "dee1mooCh",
		message: {
			body: "test",
			options: [],
		},
		exec() {
			console.log("test");
		},
	},
];

// =============================================================================

const client = new Client({
	// instace Client and set auth strategy
	authStrategy: new LocalAuth(),
});

client.on("qr", (code) => {
	console.log("Whatsapp need login.");
	qrCode.generate(code, { small: true });
});
client.on("ready", () => {
	console.log("Whatsapp is ready.");
});

// =============================================================================

client.on("message", ({ from, body }) => {
	const storage = useStorage(from);

	if (!storage.get()) {
		storage.set({
			stage: stages.find(({ entryPoint }) => entryPoint).id,
			step: 0,
		});
	}

	var currentStage = stages.find(({ id }) => id === storage.get().stage);

	if (currentStage && storage.get().step == 0) {
		const reply = `${
			currentStage.message.body
		}\n${currentStage.message.options.map((item, index) => {
			return `\n*[${index + 1}]* - ${item.label}`;
		})}`;

		client.sendMessage(from, reply);
		storage.set({
			...storage.get(),
			step: 1,
		});
		currentStage.exec();
	} else if (
		currentStage.message.options[Number(body) - 1] &&
		storage.get().step == 1
	) {
		storage.set({
			...storage.set(),
			stage: currentStage.message.options[Number(body) - 1].link,
		});

		currentStage = stages.find(({ id }) => id === storage.get().stage);

		const reply = `${
			currentStage.message.body
		}\n${currentStage.message.options.map((item, index) => {
			return `\n*[${index + 1}]* - ${item.label}`;
		})}`;

		client.sendMessage(from, reply);
		currentStage.exec();
	} else {
		client.sendMessage(
			from,
			"Você digitou corretamente?\nNão consegui compreender."
		);
	}
});

client.initialize();
