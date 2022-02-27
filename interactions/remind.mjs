import { SlashCommandBuilder } from '@discordjs/builders';


export const name = 'remind';

export const command = new SlashCommandBuilder()
    .setName('remind').setDescription('Create a reminder for yourself.')
    .addStringOption((option) =>  option.setName('message').setDescription('What would you like me to remind you of?').setRequired(true))
    .addStringOption((option) =>  option.setName('time').setDescription('How many days in advance should the reminder be sent?'))
    .addIntegerOption((option) =>  option.setName('minutes').setDescription('How many days in advance should the reminder be sent?'))
    .addIntegerOption((option) =>  option.setName('hours').setDescription('How many days in advance should the reminder be sent?'))
    .addIntegerOption((option) =>  option.setName('days').setDescription('How many days in advance should the reminder be sent?'))
    .addIntegerOption((option) =>  option.setName('weeks').setDescription('How many days in advance should the reminder be sent?'))
    .addIntegerOption((option) =>  option.setName('months').setDescription('How many days in advance should the reminder be sent?'))
    .addIntegerOption((option) =>  option.setName('years').setDescription('How many days in advance should the reminder be sent?'))
        

export default async (interaction, client) => {
    console.log('reminder command');

    if (interaction.commandName !== 'remind') return;

    // Create unit of time
    let { second, minute, hour, day, week, month, year } = 0;
    
    // Set unit of time
    second = 1000; minute = second * 60; hour = minute * 60; day = hour * 24; week = day * 7; month = day * 30; year = day * 365;

    // Command options

    let reminder = interaction.options.getString('message');
    
    if (reminder == null) return await interaction.reply({content: 'Listen chief, I dunno how the fuck you got this far, but you managed to break all of discord doing this.', ephemeral: true });
    console.log(interaction)
    let seconds = interaction.options.getString('seconds');
    let minutes = interaction.options.getInteger('minutes') * minute;
    let hours = interaction.options.getInteger('hours') * hour;
    let days = interaction.options.getInteger('days') * day;
    let weeks = interaction.options.getInteger('weeks') * week;
    let months = interaction.options.getInteger('months') * month;
    let years = interaction.options.getInteger('years') * year;

    let time = interaction.options.getString('time');

    await interaction.deferReply({ephemeral: true});
    
    if (time) {

        const now = new Date(); let reminderDate = now + minutes + hours + days + weeks + months + years;

        await interaction.followUp({content: `${new Date(reminderDate)}`, ephemeral: true });

        
        
        
        
        
    } else {

        
        const now = new Date().getTime(); let reminderDate = now + minutes + hours + days + weeks + months + years;

        await interaction.followUp({content: `${new Date(reminderDate)}`, ephemeral: true });
        await interaction.followUp({content: `${now}`, ephemeral: true });

        await interaction.followUp({content: `${minutes}`, ephemeral: true });
        
    }








};
