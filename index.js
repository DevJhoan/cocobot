import { Client, GatewayIntentBits } from "discord.js";
import { readFileSync, writeFileSync } from "fs";

const bot = new Client({
	intents: [
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates
	]
});

function readFile(file = "./data.json") {
	try {
		const value = readFileSync(file, "utf-8");
		return JSON.parse(value);
	} catch (error) {
		writeFileSync(file, "{}");
		return {};
	}
}
function keyValueManager() {
	const file = readFile();
	return {
		set: (key, value) => {
			file[key] = value;
			writeFileSync("./data.json", JSON.stringify(file));
		},
		get: (key) => {
			return file[key];
		}
	}
}

async function main() {
	const config = readFile("./config.json");
	await bot.login(config.token);

	console.log(`Logged in as ${bot.user.tag}`);
	bot.on("messageCreate", async (message) => {
		if (message.author.bot) return;

		if (message.content.startsWith("/cocotime")) {
			await message.channel.send("🥥");
			const collector = message.channel.createMessageCollector({
				filter: (m) => !m.author.bot
			});

			let count = 0;
			collector.on("collect", async (m) => {
				console.log(m.cleanContent);
				if (m.cleanContent.includes("🥥")) {
					return count++;
				}

				return collector.stop(`int-${m.author.id}`);
			});

			collector.on("end", (collected, reason) => {
				const oldValue = keyValueManager().get("record");
				if (!reason.startsWith("int")) return;

				const [_, userId] = reason.split("-");
				keyValueManager().set("record", count);
				message.channel.send(`El usuario <@!${userId}> ha roto la cadena (${count})`);

				if (count > oldValue) {
					return message.channel.send(`✨ Se ha alcanzado un nuevo récord (${count})`);
				}

				count = 0;
			});

			return;
		}

		if (message.content.startsWith("/coco")) {
			return message.channel.send("🥥");
		}
	})
}

main();