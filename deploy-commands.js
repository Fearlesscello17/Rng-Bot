const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder().setName('roll').setDescription('Roll an aura'),
  new SlashCommandBuilder().setName('coins').setDescription('Check coins'),
  new SlashCommandBuilder().setName('shop').setDescription('View shop'),
  new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy item')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item name')
        .setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, "1494470096943452160")
      { body: commands }
    );

    console.log('Commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
