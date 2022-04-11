// Returns a command type.
export const optionFetch = async (interaction, name) => {

    switch (interaction.options._hoistedOptions[0].type) {
        case 'BOOLEAN': {

            return {
                type: 'BOOLEAN',
                bool: interaction.options.getBoolean(name),
            };
        };

        case 'CHANNEL': {

            return {
                type: 'CHANNEL',
                channel: interaction.options.getChannel(name),
            };
        };

        case 'USER': {

            return {
                type: 'USER',
                user: interaction.options.getUser(name),
            };
        };

        case 'STRING': {

            return {
                type: 'STRING',
                string: interaction.options.getString(name),
            };
        };

        case 'NUMBER': {

            return {
                type: 'NUMBER',
                number: interaction.options.getNumber(name),
            };
        };

        case 'INTEGER': {

            return {
                type: 'INTEGER',
                integer: interaction.options.getInteger(name),
            };
        };

        case 'ROLE': {

            return {
                type: 'ROLE',
                role: interaction.options.getRole(name),
            };
        };

        default: {

            return { 
                type: 'UNKNOWN',
                unknown: interaction.options.getMentionable(name),
            };
        };
    };

};

export const range = async (min, max) => {
    return ((min) && (max));
} // Needs Work.