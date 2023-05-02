const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");

// =============================================================================

const { stages, globalOptions, errorMessage } = require("./settings/stages.json");
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

function validOption(option, options) {
	let _options = [];

	for (let index = 0; index < globalOptions.length; index++) {
		_options.push(globalOptions[index].value);
	}
	for (let index = 0; index < options.length; index++) {
		_options.push((index + 1).toString());
	}

	return _options.includes(option);
}

// =============================================================================

client.on("message", ({ from, body }) => {
	const storage = useStorage(from);

	if (!storage.get()) {
		storage.set({
			stage: stages.find(({ entryPoint }) => entryPoint).id,
			isFirtContact: true,
		});
	}

	var currentStage = stages.find(({ id }) => id === storage.get().stage);

	if (currentStage) {
		const reply = () => {
			currentStage = stages.find(({ id }) => id === storage.get().stage);

			return `${currentStage.message.body}\n${currentStage.message.options.map(
				(item, index) => {
					return `\n*[${index + 1}]* - ${item.label}`;
				}
			)}${globalOptions.map((item) => {
				return `\n*[${item.value}]* - ${item.label}`;
			})}`;
		};

		if (storage.get().isFirtContact) {
			client.sendMessage(from, reply());
			storage.set({ ...storage.get(), isFirtContact: false });
		} else if (validOption(body, currentStage.message.options)) {
			storage.set({
				...storage.get(),
				stage: globalOptions.find(({ value }) => value === body)
					? globalOptions.find(({ value }) => value === body).link
					: currentStage.message.options[Number(body) - 1].link,
			});

			client.sendMessage(from, reply());
		} else {
			client.sendMessage(
				from,
				errorMessage
			);
		}

		eval(currentStage.exec);
	}
});

client.initialize();
