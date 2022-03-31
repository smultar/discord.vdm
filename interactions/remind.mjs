import { SlashCommandBuilder } from '@discordjs/builders';
import { write, read, fetchAll, remove } from '../database/index.js';



export const name = 'remind';

export const command = new SlashCommandBuilder()
    .setName('remind').setDescription('Create a reminder for yourself.')
    .addStringOption((option) => option.setName('message').setDescription('Shows a messages, when your being reminded').setRequired(true))
    .addStringOption((option) => option.setName('time').setDescription('Use the standard calendar format `MM/DD/YYYY HH:MM AM/PM`. Example: `01:01:2020 12:00 AM`'))
    .addStringOption((option) => option.setName('cancel').setDescription('Cancels an upcoming reminder by its id.'))
    .addStringOption((option) => option.setName('interval').setDescription('How often a reminder should repeat. Example: `1 d` for daily, `1 w` for weekly, `1 m` for monthly.'))
    .addIntegerOption((option) => option.setName('minutes').setDescription('Adds a number of minutes to the current time.'))
    .addIntegerOption((option) => option.setName('hours').setDescription('Adds a number of hours to the current time.'))
    .addIntegerOption((option) => option.setName('days').setDescription('Adds a number of days to the current time.'))
    .addIntegerOption((option) => option.setName('weeks').setDescription('Adds a number of weeks to the current time.'))
    .addIntegerOption((option) => option.setName('months').setDescription('Adds a number of months to the current time.'))
    .addIntegerOption((option) => option.setName('years').setDescription('Adds a number of years to the current time.'));
        
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
    let interval = interaction.options.getString('interval');
    
    let cancel = interaction.options.getString('cancel');
    
    let minutes = interaction.options.getInteger('minutes') * minute;
    let hours = interaction.options.getInteger('hours') * hour;
    let days = interaction.options.getInteger('days') * day;
    let weeks = interaction.options.getInteger('weeks') * week;
    let months = interaction.options.getInteger('months') * month;
    let years = interaction.options.getInteger('years') * year;
    
    if (interaction.options._hoistedOptions.length < 2) return interaction.followUp({content: 'Sorry need to specify a time for the reminder.', ephemeral: true });

    // Persistence

    if (time) {
        // Time
        let timeArray = time.trim()?.split(' ');
        let date = timeArray[0]?.split('/');
        let hours = timeArray[1]?.split(':');
        let ampm = timeArray[2]?.toLowerCase();
        
        let MM, DD, YYYY, HH, MMM, AMPM; // Standard date format 01:01:2022 12:00 AM

        MM = ~~date[0]; DD = ~~date[1]; YYYY = (date[2]) ? ~~date[2] : new Date().getFullYear();
        HH = ~~hours[0]; MMM = ~~hours[1]; AMPM = ampm;

        let reminderTimeStamp = new Date(YYYY, MM-1, DD, (ampm == 'pm') ? HH+12 : HH, MMM, 0);
        
        // Interval
        await interaction.followUp({content: `Ok, I'll remind you to **"${reminder}"** on **${reminderTimeStamp.toDateString()}.**`, ephemeral: true });

        // Interval
        if (interval) {

            let intervalArray = interval.trim()?.split(' ');
            let amount = ~~intervalArray[0];
            let unit = intervalArray[1];

            if (unit == 'd') interval = day * amount;
            if (unit == 'w') interval = week * amount;
            if (unit == 'm') interval = month * amount;
            if (unit == 'y') interval = year * amount;

            if (unit == 'd') await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'days' : 'day'}***`, ephemeral: true });
            if (unit == 'w') await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'weeks' : 'week'}***`, ephemeral: true });
            if (unit == 'm') await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'months' : 'month'}***`, ephemeral: true });
            if (unit == 'y') await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'years' : 'year'}***`, ephemeral: true });
        }

        const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
        const messages = await read("set", { id: 'reminders' }).then(value => value.dataValues);
        const channel = await client.guilds.cache.get(guild.value).channels.cache.get(messages.value);
        const post = await channel.send(`"${reminder}", on **${reminderTimeStamp.toDateString()}**`);

        // Save object and post to database and discord server.
        await write('rem', {
            id: post.id,
            time: reminderTimeStamp.getTime(),
            interval: (interval) ? interval : 'null',
            value: reminder,
        });

        client.reminders.set(post.id, {
            id: post.id,
            time: reminderTimeStamp.getTime(),
            interval: (interval) ? interval : 'null',
            value: reminder,
        });
    };

    if (minutes || hours || days || weeks || months || years) {
        
        const now = new Date().getTime(); let reminderTimeStamp = new Date(now + minutes + hours + days + weeks + months + years);
        
        const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
        const messages = await read("set", { id: 'reminders' }).then(value => value.dataValues);
        const channel = await client.guilds.cache.get(guild.value).channels.cache.get(messages.value);
        const post = await channel.send(`"${reminder}", on **${reminderTimeStamp.toDateString()}**`);

        // Interval
        if (interval) {
            let intervalArray = interval.trim()?.split(' ');
            let amount = ~~intervalArray[0];
            let unit = intervalArray[1];

            if (unit.toLowerCase().startsWith('d')) interval = day * amount;
            if (unit.toLowerCase().startsWith('w')) interval = week * amount;
            if (unit.toLowerCase().startsWith('m')) interval = month * amount;
            if (unit.toLowerCase().startsWith('y')) interval = year * amount;

            if (unit.toLowerCase().startsWith('d')) await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'days' : 'day'}***`, ephemeral: true });
            if (unit.toLowerCase().startsWith('w')) await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'weeks' : 'week'}***`, ephemeral: true });
            if (unit.toLowerCase().startsWith('m')) await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'months' : 'month'}***`, ephemeral: true });
            if (unit.toLowerCase().startsWith('y')) await interaction.followUp({content: `*This reminder will repeat every **${(amount > 1) ? amount :''} ${(amount > 1) ? 'years' : 'year'}***`, ephemeral: true });
        }

        // Save object and post to database and discord server.
        await write('rem', {
            id: post.id,
            time: reminderTimeStamp.getTime(),
            interval: (interval) ? interval : 'null',
            value: reminder,
        });

        client.reminders.set(post.id, {
            id: post.id,
            time: reminderTimeStamp.getTime(),
            interval: (interval) ? interval : 'null',
            value: reminder,
        });

        await interaction.followUp({content: `Ok, I'll remind you to **"${reminder}"** on **${reminderTimeStamp.toDateString()}.**`, ephemeral: true });
    }
};


