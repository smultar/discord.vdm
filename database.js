import Sequelize from "sequelize/dist";

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
    name: {type: Sequelize.STRING, unique: true},
    value: {type: Sequelize.STRING},
});

// Storage Definitions
const reminderDef = settings.define('settings', {
    id: { type: Sequelize.STRING, unique: true},
    time: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING},
});

// Storage Definitions
const messageDef = settings.define('settings', {
    id: { type: Sequelize.STRING, unique: true },
    thread: { type: Sequelize.STRING },
    token: { type: Sequelize.STRING },
    tokenID: { type: Sequelize.STRING },
    status: { type: Sequelize.STRING },
});


settings.sync(); reminders.sync(); messages.sync();


const write = async (data) => {

}

const read = async (type) => {
    switch (type) {
        case "set": { // Settings

        }

        case "rem": { // Reminders

        }

        case "mes": { // Messages

        }
    }
}

const update = async (data) => {};
const remove = async (data) => {};
const define = async (data) => {};