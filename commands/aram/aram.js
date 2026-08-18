const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

const MAX_PLAYERS = 5;
const DICE_SIDES = 5; // 1d5
const ROLL_DELAY_MS = 1500; // suspense delay between each reveal
const IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwICgv1MKLXoEaJ_VHCYmsRh6Orq1Far-3ZplpMNgG2w&s";
let SUMMARY_IMAGE_URL =
  "https://i.redd.it/sukuna-meme-v0-ih2umntcd58h1.jpg?width=480&format=pjpg&auto=webp&s=06ef533a8f215c8e05c33b62246e0133014cb140";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rollDice = () => Math.floor(Math.random() * DICE_SIDES) + 1; // 1..5
const zeusRoll = () => Math.random() < 0.5; // true = zeus, false = not zeus
// random flavor lines to make each roll message feel alive
const ROLL_FLAVOR = [
  "🎲 ตัวเต๋ากลิ้งไปกลิ้งมา...",
  "🎲 ฟ้าลิขิต...",
  "🎲 ดวงจะพาไปทางไหนนะ...",
  "🎲 เขย่า เขย่า แล้วก็...",
  "🎲 ใครจะซวยวันนี้...",
];

const ROLL_EMOJI_BY_VALUE = {
  1: "🔥",
  2: "😎",
  3: "😐",
  4: "😬",
  5: "💀",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aram")
    .setDescription("เริ่มเซสชันสุ่มซ่อนมาร"),

  async execute(interaction) {
    const participants = new Map(); // userId -> username

    const rolls = new Map(); // userId -> roll value (filled during rollout)

    // status column shows: ⬜ not joined, ✅ joined & waiting, or the roll number once rolled
    const buildParticipantList = () => {
      const entries = [...participants.entries()]; // [userId, username]
      const lines = [];

      for (let i = 0; i < MAX_PLAYERS; i++) {
        const entry = entries[i];
        const num = `${i + 1}.`.padEnd(3);
        const label = (entry ? entry[1] : "-").padEnd(16);

        let status = "⬜";
        if (entry) {
          const roll = rolls.get(entry[0]);
          status = roll !== undefined ? `🎲 ${roll}` : "✅";
        }
        lines.push(`${num}${label}${status}`);
      }
      return "```\n" + lines.join("\n") + "\n```";
    };

    const buildEmbed = () =>
      new EmbedBuilder()
        .setTitle("ARAM สุ่มซ่อนมาร")
        .setDescription("เล่นธรรมดาไม่ชอบ ชอบสุ่มจำนวนที่จะต้องชนะ")
        .setColor(0xff0000)
        .setImage(IMAGE_URL)
        .addFields({
          name: `ผู้เข้าร่วม (${participants.size}/${MAX_PLAYERS})`,
          value: buildParticipantList(),
        })
        .setFooter({
          text: `ผู้โชคร้าย ${participants.size}/${MAX_PLAYERS} คน`,
        })
        .setTimestamp();

    const buildSummaryEmbeds = () => {
      const total = [...rolls.values()].reduce((a, b) => a + b, 0);
      const avg = rolls.size ? (total / rolls.size).toFixed(2) : "0";

      let unluckyLine = "";
      if (rolls.size) {
        const maxRoll = Math.max(...rolls.values());
        const unluckyNames = [...rolls.entries()]
          .filter(([, r]) => r === maxRoll)
          .map(([id]) => `<@${id}>`);
        unluckyLine = `💀 ผู้โชคร้ายที่สุด: ${unluckyNames.join(", ")} (ทอยได้ ${maxRoll})`;
      }

      // Determine Zeus rule and image URL for this game session only
      const isZeus = zeusRoll();
      const zeusRule = (avg) => (isZeus ? Math.ceil(avg) : Math.floor(avg));
      const currentImageUrl = isZeus
        ? "https://static.wikia.nocookie.net/ageofempires/images/1/14/AoMRT_Greek_Zeus.webp/revision/latest/scale-to-width-down/1200?cb=20250701110532"
        : SUMMARY_IMAGE_URL;

      // embed #1: image only — Discord renders embeds in array order, image-first this way
      const imageEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setImage(currentImageUrl);

      // embed #2: the actual stats, follows right below the image
      const statsEmbed = new EmbedBuilder()
        .setTitle("ARAM สุ่มซ่อนมาร — ผลสรุป")
        .setDescription(unluckyLine)
        .setColor(0xff0000)
        .addFields(
          {
            name: `รายชื่อผู้เข้าร่วม (${participants.size}/${MAX_PLAYERS})`,
            value: buildParticipantList(),
          },
          { name: "รวม (Sum)", value: `${total}`, inline: true },
          { name: "เฉลี่ย (Average)", value: `${avg}`, inline: true },
          { name: "ต้องเล่นทั้งหมด", value: `${zeusRule(avg)}` },
        )
        .setTimestamp();

      return [imageEmbed, statsEmbed];
    };

    const buildRollMessageContent = (userId, username, roll) =>
      `<@${userId}> ${ROLL_FLAVOR[Math.floor(Math.random() * ROLL_FLAVOR.length)]}\n` +
      `ทอยได้ **${roll}** ${ROLL_EMOJI_BY_VALUE[roll]}`;

    const runRollSequence = async () => {
      const channel = message.channel;

      for (const [userId, username] of participants) {
        await sleep(ROLL_DELAY_MS);
        const roll = rollDice();
        rolls.set(userId, roll);
        await channel
          .send({
            content: buildRollMessageContent(userId, username, roll),
          })
          .catch(() => {});
      }

      await sleep(ROLL_DELAY_MS);
      await channel.send({ embeds: buildSummaryEmbeds() }).catch(() => {});
    };

    const joinButton = new ButtonBuilder()
      .setCustomId("aram_join")
      .setLabel("Join")
      .setStyle(ButtonStyle.Success);

    const startButton = new ButtonBuilder()
      .setCustomId("aram_start")
      .setLabel("เริ่มสุ่ม")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true); // enabled once players have joined

    const row = new ActionRowBuilder().addComponents(joinButton, startButton);

    const message = await interaction.reply({
      embeds: [buildEmbed()],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000, // 5 minute join window
    });

    collector.on("collect", async (btnInteraction) => {
      // --- JOIN ---
      if (btnInteraction.customId === "aram_join") {
        if (participants.has(btnInteraction.user.id)) {
          return btnInteraction.reply({
            content: "คุณเข้าร่วมแล้ว!",
            ephemeral: true,
          });
        }

        if (participants.size >= MAX_PLAYERS) {
          return btnInteraction.reply({
            content: "เต็มแล้ว!",
            ephemeral: true,
          });
        }
        const displayName =
          btnInteraction.member?.displayName ?? btnInteraction.user.username;
        participants.set(btnInteraction.user.id, displayName);

        // enable start button once at least 1 player joined
        startButton.setDisabled(participants.size === 0);

        const updatedRow = new ActionRowBuilder().addComponents(
          joinButton,
          startButton,
        );
        await btnInteraction.update({
          embeds: [buildEmbed()],
          components: [updatedRow],
        });
        return;
      }

      // --- START ---
      if (btnInteraction.customId === "aram_start") {
        collector.stop("started");

        const disabledRow = new ActionRowBuilder().addComponents(
          joinButton.setDisabled(true),
          startButton.setDisabled(true),
        );
        await btnInteraction.update({
          embeds: [buildEmbed()],
          components: [disabledRow],
        });

        await runRollSequence();
      }
    });

    collector.on("end", async (_collected, reason) => {
      if (reason !== "started") {
        const disabledRow = new ActionRowBuilder().addComponents(
          joinButton.setDisabled(true),
          startButton.setDisabled(true),
        );
        await message.edit({ components: [disabledRow] }).catch(() => {});
      }
    });
  },
};
