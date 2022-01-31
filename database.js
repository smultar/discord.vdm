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

// Storage Definitions
const settingsDef = settings.define('settings', {
    name: {type: Sequelize.STRING, unique: true},
    value: {type: Sequelize.ABSTRACT},
    
})


const write = async (data) => {

}

const read = async (type) => {
    switch (type) {
        case "settings": {

        }

        case "reminders": {

        }

        case "messages": {

        }
    }
}

const update = async (data) => {};
const remove = async (data) => {};
const define = async (data) => {};