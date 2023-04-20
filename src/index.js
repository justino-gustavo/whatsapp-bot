const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");

const client = new Client({								// instace Client and set auth strategy
	authStrategy: new LocalAuth()
});


client.on("qr", (code) => {								// on client generate QR Code display in terminal
	qrCode.generate(code, { small: true });
});
client.on("ready", () => {
	console.log("Whatsapp is ready.");
});


client.initialize();
