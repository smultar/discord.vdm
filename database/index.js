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
    interval: { type: Sequelize.STRING },
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

// Blocked Definitions
const blocked = new Sequelize('blocked', 'admin', 'bizu', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './database/blocked.sqlite',
});

const blockedDef = blocked.define('blocked', {
    id: { type: Sequelize.STRING, unique: true, primaryKey: true },
    reason: { type: Sequelize.STRING },
    time: { type: Sequelize.STRING },
});

// // Database Functions

const write = async (type, data) => {
    
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const stream = await settingsDef.create(data);
                return stream;
            }
            
            case "rem": { // Reminders

                const stream = await remindersDef.create(data);
                return stream;
            }
            
            case "blo": { // Blocked
                const stream = await blockedDef.create(data);
                return stream;
            }

            case "mes": { // Messages
                const stream = await messagesDef.create(data);
                return stream;
            }
        }
        
    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") { 
            console.log('Database Error: Items already exist.');
            return null;
        }

        console.log('Database Error: ' + error);
        
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
            
            case "blo": { // Blocked
                    const data = await blockedDef.findOne({where: query});
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

const update = async (type, target, changes) => {
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
            
            case "blo": { // Blocked
                const data = await blockedDef.update( {...changes}, { where: target });
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

const fetchAll = async (type, tag) => {
    // Error Handling
    try {
        switch (type) {
            case "set": { // Settings
                const data = await (tag) ? settingsDef.findAll({attributes: [`${tag}`]}) : settingsDef.findAll();
                return data;
            }
            
            case "rem": { // Reminders
                const data = await (tag) ? remindersDef.findAll({attributes: [`${tag}`]}) : remindersDef.findAll();
                return data;
            }
            
            case "blo": { // Blocked
                const data = (tag) ? blockedDef.findAll({attributes: [`${tag}`]}) : blockedDef.findAll();
                return data;
            }

            case "mes": { // Messages
                const data = (tag) ? messagesDef.findAll({attributes: [`${tag}`]}) : messagesDef.findAll();
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
                const data = await settingsDef.destroy({ where: { id: target }});
                return data;
            }
            
            case "rem": { // Reminders
                const data = await remindersDef.destroy({ where: { id: target }});
                return data;
            }
            
            case "blo": { // Blocked
                const data = await blockedDef.destroy({ where: { id: target }});
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

settingsDef.sync(); remindersDef.sync(); messagesDef.sync(); blockedDef.sync();

export { write, read, update, remove, fetchAll };