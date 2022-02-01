import Sequelize from "sequelize";

// Setting Definitions
const settings = new Sequelize('settings', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './database/settings.sqlite',
});

const settingsDef = settings.define('settings', {
    id: {type: Sequelize.STRING, unique: true, primaryKey: true},
    value: {type: Sequelize.STRING},
});


// Reminder Definitions
const reminders = new Sequelize('reminders', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './database/reminders.sqlite',
});

const remindersDef = reminders.define('reminders', {
    id: { type: Sequelize.STRING, unique: true, primaryKey: true },
    time: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING},
});


// Messages Definitions
const messages = new Sequelize('messages', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './database/messages.sqlite',
});

const messagesDef = messages.define('messages', {
    id: { type: Sequelize.STRING, unique: true, primaryKey: true },
    thread: { type: Sequelize.STRING },
    token: { type: Sequelize.STRING },
    tokenID: { type: Sequelize.STRING },
    status: { type: Sequelize.STRING },
});


// Database Functions

const write = async (type, data) => {
    
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const stream = await settingsDef.create(data);
                return stream; console.log(data)
            }
            
            case "rem": { // Reminders
                const stream = await remindersDef.create(data);
                return stream;
            }
            
            case "mes": { // Messages
                const stream = await messagesDef.create(data);
                return stream;
            }
        }
        
    } catch (error) {

        console.log(error);
        return null;
    }
    
}

const read = async (type, query) => {
    
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const data = await settingsDef.findOne({where: query});
                return data;
            }
            
            case "rem": { // Reminders
                const data = await remindersDef.findOne({where: query});
                return data;
            }
            
            case "mes": { // Messages
                const data = await messagesDef.findOne({where: query});
                return data;
            }
        }
        
    } catch (error) {
        return null;
    }
}

const update = async (type, changes, target) => {
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const data = await settingsDef.update( {...changes}, { where: target });
                return data;
            }
            
            case "rem": { // Reminders
                const data = await remindersDef.update( {...changes}, { where: target });
                return data;
            }
            
            case "mes": { // Messages
                const data = await messagesDef.update( {...changes}, { where: target });
                return data;
            }
        }
        
    } catch (error) {
        return null;
    }
};

const fetchAll = async (type) => {
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const data = await settingsDef.fetchAll({ attributes: ['name'] });
                return data;
            }
            
            case "rem": { // Reminders
                const data = await remindersDef.fetchAll({ attributes: ['id'] });
                return data;
            }
            
            case "mes": { // Messages
                const data = await messagesDef.fetchAll({ attributes: ['id'] });
                return data;
            }
        }
        
    } catch (error) {
        return null;
    }
}

const remove = async (type, target) => {
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const data = await settingsDef.destroy({ where: { name: target }});
                return data;
            }
            
            case "rem": { // Reminders
                const data = await remindersDef.destroy({ where: { id: target }});
                return data;
            }
            
            case "mes": { // Messages
                const data = await messagesDef.destroy({ where: { id: target }});
                return data;
            }
        }
        
    } catch (error) {
        return null;
    }
};

settingsDef.sync({ force: true }); remindersDef.sync({ force: true }); messagesDef.sync({ force: true });

export { write, read, update, remove,  fetchAll };

// Notes:
// - Reminders:
//     Date and Reason

// - Messages:
//     Target Channel, Thread under channel, with hook.
//     Thread States

// - Settings:
//     Target Channel
//     Auto Add `Helm` to channel. True/False
//     Accepting Messages. True/False
