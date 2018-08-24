const config = require ("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

//fill in mysql shit later honestly... 

let messageArray
let command
let verification 
let username

//start up 
client.on('ready', () =>
{
	console.log('Ready!'); 
});

client.on('message', message => 
{
	//Reutrn if authored by bot 
	if (message.author.bot) return; 

	if (message.channel.type === "text")
	{	
	console.log(message.content);
	messageArray = message.content.split (" "); 
	command = messageArray[0]; 
	verification = messageArray[1];
	username = message.member.user.tag; 
	console.log(username); 

	if (typeof verification != 'undefined' && verification)
	{	
		charCount = verification.length;
		if (charCount !=32)
		{
			message.reply("Hey that doesn't seem quite right :( ... are you sure your verification code is 32 characters long? Try again or Contact a Developer :)"); 
			return; 
		}
		else 
		{
			if (!command.startsWith(config.prefix)) return; 
			if (command === `${config.prefix}verify`) 
			{
				message.reply("hey this works!");
			}
		}

	}
	else 
	message.reply ("Whoops! Looks like you're lacking a verification code. The Dev Team has sent you one in your email, make sure you enter that next time :)"); 
		
	}	
	return; 
}); 

client.login('NDgxODkzOTgzMTYxOTQyMDM2.Dl8-2A.luFbY4xHcUI9G0ravu7WfHe0vhI');
