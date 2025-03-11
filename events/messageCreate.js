const { Events, MessageFlags } = require('discord.js');
const { clientId, aiApiKey, prompt } = require('../config.json');
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: aiApiKey
});

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        if (message.author.bot) return;
        if (!message.mentions.users.has(clientId)) return;
        
        try {
            const messages = await message.channel.messages.fetch({ limit: 5 });
            const messageHistory = Array.from(messages.values())
                .reverse()
                .map(msg => ({ role: msg.author.id === clientId ? 'assistant' : 'user', content: msg.content }));
            
            messageHistory.unshift({ role: 'system', content: prompt })
            
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: messageHistory,
                store: true
            });

            const botReply = response.choices[0].message.content;
            message.reply(botReply);
            
        } catch (err)   {
            console.error(err);
            message.reply("hold on the feds are at my door gimme a sec")
        }
	},
};
