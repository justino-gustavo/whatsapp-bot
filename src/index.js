const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");

// =============================================================================

const { stages, globalOptions } = require("./settings/stages.json");
const useStorage = require("./utils/storage");

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

	if (currentStage && storage.get().step === 0) {
		const reply = `${
			currentStage.message.body
		}\n${currentStage.message.options.map((item, index) => {
			return `\n*[${index + 1}]* - ${item.label}`;
		})}${globalOptions.map((item) => {
			return `\n*[${item.value}]* - ${item.label}`;
		})}`;

		client.sendMessage(from, reply);
		storage.set({
			...storage.get(),
			step: 1,
		});
		eval(currentStage.exec);
	} else if (
		(currentStage.message.options[Number(body) - 1] ||
			globalOptions.find(({ value }) => value === body)) &&
		storage.get().step == 1
	) {
		storage.set({
			...storage.get(),
			stage: globalOptions.find(({ value }) => value === body)
				? globalOptions.find(({ value }) => value === body).link
				: currentStage.message.options[Number(body) - 1].link,
		});

		currentStage = stages.find(({ id }) => id === storage.get().stage);

		const reply = `${
			currentStage.message.body
		}\n${currentStage.message.options.map(
			(item, index) => `\n*[${index + 1}]* - ${item.label}`
		)}${globalOptions.map((item) => `\n*[${item.value}]* - ${item.label}`)}`;

		client.sendMessage(from, reply);
		eval(currentStage.exec);
	} else {
		client.sendMessage(
			from,
			"Você digitou corretamente?\nNão consegui compreender."
		);
	}
});

client.initialize();
