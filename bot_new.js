
const Discord = require("discord.js");
const client = new Discord.Client();

//fill in mysql shit later honestly... 

//start up 
client.on('ready', () =>
{
	console.log('Ready!'); 
});

client.on('message', message => 
{
	//Reutrn if authored by bot 
	if (message.author.bot) return; 

	if (message.channel.type === text)
	{	
	console.log(message.content);
	if (message.content == '!verify' )
	message.channel.send('This works!')
	}		
}); 

client.login('NDgxODkzOTgzMTYxOTQyMDM2.Dl8-2A.luFbY4xHcUI9G0ravu7WfHe0vhI');
