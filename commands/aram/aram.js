const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aramสงค์ซ่อนมาร")
    .setDescription("สุ่มจำนวนเกมที่ต้องเล่นในโหมด ARAM"),
  async execute(interaction) {
    await interaction.reply("ARAM ซ่อนมาร");
  },
};
