client.guilds.cache.get('888254393554722847').channels.cache.get('935963236216504400').createWebhook(`${client.user.tag}`, avatar).then(async (webhook) => {
    let webhookAdd = await write("set", {
        id: 'webhook',
        value: webhook.id
    });

    let webhookTokenAdd = await write("set", {
        id: 'webhookToken',
        value: webhook.token
    })

    console.log(webhook);

    client.webhook = new WebhookClient({ id: webhook.id, token: webhook.token });

    client.webhook.send({ content: `${client.user.tag} has created a new webhook`, username: client.user.username, avatar: avatar})
})

        // Settings Write
        let messagesAdd = await write("set", {
            id: 'messages',
            value: '935963236216504400'
        });

        let remindersAdd = await write("set", {
            id: 'reminders',
            value: '935964011831365663'
        });

        let categoryAdd = await write("set", {
            id: 'category',
            value: '888299808937373706'
        });

        let guildAdd = await write("set", {
            id: 'guild',
            value: '888254393554722847'
        });