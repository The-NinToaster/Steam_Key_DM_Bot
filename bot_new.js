const config_new = require ("./config_new.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const mysql = require("mysql"); 

let messageArray;
let command;
let verification;
let username;

//mysql
var pool = mysql.createPool({
	//connectionLimit: 10,
	host: `${config_new.host}`,
	user: `${config_new.user}`,
	password: `${config_new.password}`,
	database: `${config_new.database}`
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
		if (!message.content.startsWith(`${config_new.prefix}`))
		return; 

		console.log(message.content);
		messageArray = message.content.split (" "); 
		command = messageArray[0]; 
		verification = messageArray[1];
		username = message.member.user.tag; 
		console.log(username); 

		if (typeof verification !== 'undefined' && verification)
		{		
			charCount = verification.length;
			
			if (charCount !=32)
			{
			message.delete(1000); //deletes after 1 second 
			message.reply("Hey that doesn't seem quite right :tired_face: ... are you sure your verification code is 32 characters long? Try again or Contact a Developer :smile:"); 
			return; 
			}
			else 
			{
				if (command === `${config_new.prefix}verify`) {
					message.reply("Reading... :thinking:"); 
					message.delete(1000); //deletes after 1 second 
					//message.reply("hey this works!");
					let sql = "SELECT * FROM verification WHERE verification_code = " + mysql.escape(verification); 
					let steamKeySQL = "SELECT * FROM steam_keys WHERE key_given = 0 LIMIT 1";

					pool.getConnection(function (error, tempConnection)
					{
						if (!!error)
						{
							console.log(error); 
							message.reply("Uh oh! It seems we can't reach our main system right now :cold_sweat: Reach out a developer and tell them that the system is down, please :disappointed:");
						}
						else 
						{
							tempConnection.query(sql, function(err, signupIdResults)
							{
								if (err) throw err; 

								if  (signupIdResults.length > 1)
								message.reply("Yikes! We just found two codes! :confounded: I'm confused now :weary: Ask a Developer for help with this error along with your code"); 

								else if (signupIdResults == 0)  
								message.reply("Oh no! We can't find your code in our system :cry: Did you type it right? Try copy-pasting your code instead :smile:"); 

								else 
								{
									console.log(signupIdResults[0].verification_used);
									if (signupIdResults[0].verification_used == 0) //if key has not been used 
									{
										message.reply("One Key coming right up! :grin: Make sure to check your Direct Messages!. Remember you can only ask for one key per user"); 
										tempConnection.query(steamKeySQL, function(err, steamKeyResults)
										{
											if (err) throw err; 

											if (steamKeyResults.length == 1) //if key is found
											{
												let setVerificationActive = "UPDATE verification SET verification_used = 1 WHERE verification_code = " + signupIdResults[0]; 
												let setVerificationName = "UPDATE verification SET discord_username = " + username + " WHERE verification_code = " + signupIdResults[0]; 
												let setSteamKeyActive = "UPDATE steam_keys SET key_given = 1 WHERE steam_key = " + steamKeyResults[0];
												let setSteamKeyName = "UPDATE steam_keys SET discord_username = " + username + " WHERE steam_key = " + steamKeyResults[0];
										
												message.author.send
												("You asked? I deliver! Here's one key for you!\n" + 
													"All you have to do now is go to your Steam Library, click on \"ADD A GAME\" then, \"Activate Product on Steam\" (If you have a skin, follow the steps you need), and follow the instructions!\n" + 
													"If you do not have steam, you can install it from here: https://store.steampowered.com/about/.  The game is currently compatible on Windows platforms, with Linux and Mac Support coming soon.\n" +
													"You can check the Table Top Gods server's #getting_started and #news_and_updates channels for more information about the game, testing period and build information.\n" +
													"If you want to invite a friend to the program, let a developer know so they can tell you how to invite them.\n" + 
													"Thank you for joining the testing program and we hope to hear your feedback!\n" + 
													"```Your Steam Key: " + steamKeyResults[0].steam_key + "```"
												); 

												tempConnection.query(setSteamKeyActive, function (err, steamKeyValidationResults)
												{
													if (err) throw err;
												});
										
												tempConnection.query(setVerificationActive, function (err, signupValidationResults) 
												{
													if (err) throw err;
												});
                                        
												tempConnection.query(setSteamKeyName, function (err, SteamKeyName) 
												{
													if (err) throw err;
												});
												 
												tempConnection.query(setVerificationName, function (err, VerificationName)
												{
													if (err) throw err; 
												});
											}

											else 
											{
											message.reply("Oh no! :dissapointed: It seems like there are no keys left. Let a Developer know!");
											}
										}); 
									}

									else 
									message.reply("Uh oh! :confounded: It seems that key has been used by someone else, or even yourself! If it wasn't you, make sure you wrote it correctly. If you're absolutely sure if wasn't you and you can swear on it, let a Developer know so they can help you!'");
								}
							}); 
							tempConnection.release(); 
						};
					}); 
				};
			};
		}
		else
		{
			message.reply ("Whoops! Looks like mispelled something or you're lacking a verification code :no_mouth: The Dev Team has sent you a code in your email, make sure you enter that next time :smile:"); 
		};
	};
}); 

client.login(`${config_new.token}`);