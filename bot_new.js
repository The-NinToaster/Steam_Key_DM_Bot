const config = require ("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const mysql = require("mysql"); 

//fill in mysql shit later honestly... 

let messageArray
let command
let verification 
let username

//mysql
var pool = mysql.createPool({
	host: "localhost",
	user: "ttg_admin",
	password: "5x7iwkNp",
	database: "Alpha_Key_Bot"
});

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
			message.reply("Hey that doesn't seem quite right :tired_face: ... are you sure your verification code is 32 characters long? Try again or Contact a Developer :smile:"); 
			return; 
		}
		else 
		{
			if (!command.startsWith(config.prefix)) return; 
			if (command === `${config.prefix}verify`) 
			{
				//message.reply("hey this works!");
				let sql = "SELECT * FROM verification WHERE verification_code = " + mysql.escape(verification); 
				let steamKeySQL = "SELECT * FROM steam_keys WHERE key_given = 0 LIMIT 1"

				pool.getConnection(function (error, tempConnection)
				{
					if (!!error)
					{
						message.reply("Uh oh! It seems we can't reach our main system right now :cold_sweat: Reach out a developer and tell them that the system is down, please :dissapointed:'")
					}
					else 
					{
						tempConnection.query(sql, function(err, signupIdResults)
						{
							if (err) throw err; 

							if (signupIdResults.length > 1)
							message.reply("Yikes! We just found two codes! :confounded: I'm confused now :weary: Ask a Developer for help with this error along with your code"); 

							else if (signupIdResults = 0) 
							message.reply("Oh no! We can't find your code in our system :cry: Did you type it right? Try copy-pasting your code instead :smile:"); ]

							else 
							{
								if (signupIdResults[0].verification_used == 0)
								message.reply("One Key coming right up! :grin: Make sure to check your Direct Messages!. Remember you can only ask for one key per user");
								
								tempConnection.query(steamKeySQL, function(error, steamKeyResults)
								{
									if (err) throw err; 

									if (steamKeyResults.length == 1)
									{
										let setVerifivationActive = "UPDATE verification SET verification_used = 1 WHERE verification_code = " + signupIdResults[0]; 
										let updateVerificationName = "UPDATE verification SET discord_username = " + message.member.user.tag + "WHERE verification_code = " + signupIdResults[0]; 
									}
								}
							}
						})
					}

				})
			}
		}

	}
	else 
	message.reply ("Whoops! Looks like you're lacking a verification code :no_mouth: The Dev Team has sent you one in your email, make sure you enter that next time :smile:"); 
		
	}	
	return; 
}); 

client.login('NDgxODkzOTgzMTYxOTQyMDM2.Dl8-2A.luFbY4xHcUI9G0ravu7WfHe0vhI');
