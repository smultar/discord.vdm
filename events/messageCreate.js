const { MessageEmbed, WebhookClient } = require('discord.js');
module.exports = async (client, message) => {
    if (message.stickers?.first()) return;

    if (message.guild) {
        // Server
        
        if (message.author.id == '888253387072749598') return;
        if (message.webhookId) return;
        
        let session = client.activeSessions.find(session => session.targetChannel === message.channel.id);

        if (session) {

            if (message.channel.id == session.targetChannel) {

                if (message.attachments?.first()) {
                    if (message.content) {
                        client.users.cache.get(session.id).send(message.content);
                    }

                    client.users.cache.get(session.id).send(message.attachments.first().attachment);
                    
                } else {
                    client.users.cache.get(session.id).send(message.content);
                }


            }
        }


    } else {
        // Direct Messages

        if (message.author.id == '888253387072749598') return;

        let session = client.activeSessions.find(session => session.id === message.author.id);


        if (session) { 
            // Continue Session
            let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`

            const webhookClient = new WebhookClient({ id: session.tokenID, token: session.token });

            if (message.attachments?.first()) {
                if (message.content) {
                    webhookClient.send({ content: message.content, username: message.author.username, avatarURL: avatar,})
                }

                webhookClient.send({ content: message.attachments.first().attachment, username: message.author.username, avatarURL: avatar,})
                
            } else {
                webhookClient.send({ content: message.content, username: message.author.username, avatarURL: avatar,})
            }


        } else {
            client.guilds.cache.get('888254393554722847').channels.create(`${message.author.username}`, { reason: 'Test', parent: '888297881398804512', topic: message.author.id }).then(channel => {
                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`

                channel.createWebhook(message.author.username, { avatar: avatar })
                    .then(webhook => {
                        console.log(webhook); console.log(avatar);

                        client.activeSessions.push({id: message.author.id, targetChannel: channel.id, token: webhook.token, tokenID: webhook.id });
                        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });
                        
                        if (message.attachments?.first()) {
                            if (message.content) {
                                webhookClient.send({ content: message.content, username: message.author.username, avatarURL: avatar,})
                            }
                            
                            webhookClient.send({ content: message.attachments.first().attachment, username: message.author.username, avatarURL: avatar,})
                            
                        } else {
                            webhookClient.send({ content: message.content, username: message.author.username, avatarURL: avatar,})
                        }


                    })
                    .catch(console.error);

            })
        }


    }

}