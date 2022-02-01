import Sequelize from "sequelize";

const settings = new Sequelize('settings', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    Storage: 'settings.sqlite',
});

const reminders = new Sequelize('reminders', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    Storage: 'reminders.sqlite',
});

const messages = new Sequelize('messages', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    Storage: 'reminders.sqlite',
});

// Reminders Definitions
const settingsDef = settings.define('settings', {
    name: {type: Sequelize.STRING, unique: true, primaryKey: true},
    value: {type: Sequelize.STRING},
});

// Storage Definitions
const remindersDef = reminders.define('settings', {
    id: { type: Sequelize.STRING, unique: true},
    time: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING},
});

// Storage Definitions
const messagesDef = messages.define('settings', {
    id: { type: Sequelize.STRING, unique: true },
    thread: { type: Sequelize.STRING },
    token: { type: Sequelize.STRING },
    tokenID: { type: Sequelize.STRING },
    status: { type: Sequelize.STRING },
});



const write = async (type, data) => {
    
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const stream = await settingsDef.create(data);
                console.log(stream)
                return stream;
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

settingsDef.sync(); remindersDef.sync(); messagesDef.sync();

export { write, read, update, fetchAll, remove, settingsDef };

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
