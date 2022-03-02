import { SlashCommandBuilder } from '@discordjs/builders';
import { write, read, fetchAll, remove } from '../database/index.js';



export const name = 'remind';

export const command = new SlashCommandBuilder()
    .setName('remind').setDescription('Create a reminder for yourself.')
    .addStringOption((option) =>  option.setName('message').setDescription('Shows a messages, when your being reminded').setRequired(true))
    .addStringOption((option) =>  option.setName('time').setDescription('Use the standard calendar format `MM:DD:YYYY HH:MM AM/PM`. Example: `01:01:2020 12:00 AM`'))
    .addStringOption((option) =>  option.setName('repeat').setDescription('A reminder that repeats everyday, using the standard time format `HH:MM AM/PM`. Example: `12:00 AM`'))
    .addIntegerOption((option) =>  option.setName('minutes').setDescription('Adds a number of minutes to the current time.'))
    .addIntegerOption((option) =>  option.setName('hours').setDescription('Adds a number of hours to the current time.'))
    .addIntegerOption((option) =>  option.setName('days').setDescription('Adds a number of days to the current time.'))
    .addIntegerOption((option) =>  option.setName('weeks').setDescription('Adds a number of weeks to the current time.'))
    .addIntegerOption((option) =>  option.setName('months').setDescription('Adds a number of months to the current time.'))
    .addIntegerOption((option) =>  option.setName('years').setDescription('Adds a number of years to the current time.'));
        
export default async (interaction, client) => {
    console.log('reminder command');

    if (interaction.commandName !== 'remind') return;

    // Create and set units of time
    let { second, minute, hour, day, week, month, year } = 0;
    second = 1000; minute = second * 60; hour = minute * 60; day = hour * 24; week = day * 7; month = day * 30; year = day * 365;

    // Command options
    let reminder = interaction.options.getString('message');
    
    if (reminder == null) return await interaction.reply({content: 'Listen chief, I dunno how the fuck you got this far, but you managed to break all of discord doing this.', ephemeral: true });
    
    // Tells user client, that the bot is working on it
    await interaction.deferReply({ephemeral: true});

    // Options for time
    let time = interaction.options.getString('time');
    let minutes = interaction.options.getInteger('minutes') * minute;
    let hours = interaction.options.getInteger('hours') * hour;
    let days = interaction.options.getInteger('days') * day;
    let weeks = interaction.options.getInteger('weeks') * week;
    let months = interaction.options.getInteger('months') * month;
    let years = interaction.options.getInteger('years') * year;
    
    if (interaction.options._hoistedOptions.length < 2) return interaction.followUp({content: 'Sorry need to specify a time for the reminder.', ephemeral: true });

    if (time) {

        let timeArray = time.trim()?.split(' ');
        let date = timeArray[0]?.split(':');
        let hours = timeArray[1]?.split(':');
        let ampm = timeArray[2]?.toLowerCase();
        
        let MM, DD, YYYY, HH, MMM, AMPM; // Standard date format 01:01:2022 12:00 AM

        MM = ~~date[0]; DD = ~~date[1]; YYYY = ~~date[2];
        HH = ~~hours[0]; MMM = ~~hours[1]; AMPM = ampm;

        let reminder = new Date(YYYY, MM-1, DD, (ampm == 'pm') ? HH+12 : HH, MMM, 0);

        await 
        await interaction.followUp({content: `Successfully set a reminder for ${new Date(reminder)}`, ephemeral: true });
        
    } 

    if (remind) {
        let reminder = new Date(remind);
        await interaction.followUp({content: `Successfully set a reminder for ${new Date(reminder).toDateString()}`, ephemeral: true });
        
    }
    
    if (minute || hours || days || weeks || months || years) {
        
        const now = new Date().getTime(); let reminderDate = now + minutes + hours + days + weeks + months + years;
        
        client.reminders.set(interaction.id, {
            id: interaction.id,
            time: new Date(reminderDate),
            value: reminder
        });

        const save = await write("rem", {
            id: interaction.id,
            time: new Date(reminderDate),
            value: reminder
        });

        await interaction.followUp({content: `${new Date(reminderDate).toDateString()}`, ephemeral: true });
        //.toDateString()

        //new Date(1995, 11, 17, 3, 24, 0)
        
    }








};
