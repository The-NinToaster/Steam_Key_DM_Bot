const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const mysql = require("mysql");

let messageArray
let command
let verificaitonCode
let charCount;
let databaseVerificationCode;


// mysql Connection settings IP, User, Pass, Table
var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "DB Name"
});

client.on('ready', async () => {
    await console.log(`Logged in as ${client.user.tag}!`);
    try {
        let link = await client.generateInvite(["ADMINISTRATOR"]);
    } catch (e) {
        console.log(e.stack);
    }
});

client.on("message", async message => {
    //Is the author of the message a bot? We don't want this, so break the loop if true
    if (message.author.bot) return;

    // If there is a message in a regular guild channel do the following
    if (message.channel.type === "text") {
        //check the first work in the users message to see if they're trying to verify a code and if they are doing the following
        if (message.content.startsWith(".verify")) {
            //inform the user they need to DM the bot with the validation key
            message.reply("If you've been selected for the Alpha and have your validation code, please direct message the Project Winter Bot");
        };
        return;
    }


    //We only want users to communicate with the bot via dm's!
    if (message.channel.type === "dm") {

        //add each part of the DM message in an arrary
        messageArray = message.content.split(" ");

        //command variable holds the prefix and keyword
        command = messageArray[0];

        //Variable holds the validation code from the DM
        verificaitonCode = messageArray[1];

        //check that a code was sent and is being held in the varible verificationCode and not just the word .verifu 
        if (typeof verificaitonCode !== 'undefined' && verificaitonCode) {
            //get the length of the verirication code
            charCount = verificaitonCode.length;

            //check that the lenght is 32 characters long
            if (charCount != 32) {
                message.reply("Re-enter the validation code or contact an Administrator");
                return;
            } else {
                // if the command doesn't start with the prefix break
                if (!command.startsWith(config.prefix)) return;
                //if command equals .verify then... 
                if (command === `${config.prefix}verify`) {

                    // SQL query veriable to get all the users with the verification code entered by the user. There should only be 1 but lets get all just in case
                    let sql = "SELECT * FROM signup WHERE validation_code = " + mysql.escape(verificaitonCode);
                    //SQL to get all the CD Keys in the database
                    let steamKeyIdSQL = "SELECT * FROM steamkeys WHERE steam_key_activated = 0 LIMIT 1";


                    pool.getConnection(function (error, tempConnection) {
                        if (!!error) {
                            console.log("Error B'ys. The database appears to be done. RESTART!");
                            message.reply("Ooops. It appears one of our systems is turned off. DM a Admin and we'll fix this ASAP.");
                        } else {

                            //contact the database to get the users with the verification code. We're querying sql, and all the results we're saving in signupIdResults to use later
                            tempConnection.query(sql, function (err, signupIdResults) {
                                if (err) throw err;

                                //Are there more results then 1? There shouldn't be so inform the user of a error
                                if (signupIdResults.length > 1) {
                                    message.reply("Error! Duplicate of validation code in database. Contact the admin with this error and your validation code.");

                                    // Are there no results. This means the user is trying to spam random numbers to get a key or the user entered a wrong code
                                } else if (signupIdResults.length == 0) {
                                    message.reply("Validation code not found in database. Check that the code is copied correctly, and if the error continues contact the Admin.");
                                } else {
                                    // check that the users validation code has never been used.
                                    if (signupIdResults[0].validation_code_used == 0) {
                                        message.reply("Give me a minute, I'm looking through the database!");

                                        //Query the database with the SteamKeyIdSQL variable and save all the results in insteamKeyResults
                                        tempConnection.query(steamKeyIdSQL, function (error, steamKeyResults) {
                                            if (error) throw err;

                                            // If there is a key left in the Database then do the following
                                            if (steamKeyResults.length == 1) {

                                                // set the database validation code to 1 so we know that the code has been claimed
                                                let setValidationCodeActiveSQL = "UPDATE signup SET validation_code_used = 1 WHERE id = " + signupIdResults[0].id;
                                                // set steam key activated to 1 for that particular ID # so that it can't be reused.
                                                let setSteamKeyActiveSQL = "UPDATE steamkeys SET steam_key_activated = 1 WHERE steam_key_id = " + steamKeyResults[0].steam_key_id;
                                                // Also, take that steam key ID and add it to the users record so we can simply reference the ID # to a key 
                                                let setSignupSteamKeySQL = "UPDATE signup SET steam_key_id =" + steamKeyResults[0].steam_key_id + " WHERE id = " + signupIdResults[0].id;
                                                message.reply("We found a Key! Enter this into Steam! " + steamKeyResults[0].steam_key);
                                                tempConnection.query(setSteamKeyActiveSQL, function (err, steamKeyValidationResults) {
                                                    if (err) throw err;
                                                });
                                                tempConnection.query(setValidationCodeActiveSQL, function (err, signupValidationResults) {
                                                    if (err) throw err;
                                                });
                                                tempConnection.query(setSignupSteamKeySQL, function (err, signupSteamKeyResults) {
                                                    if (err) throw err;
                                                });

                                                //getting the particular server the bot is apart of based on the server ID, this is a collection.
                                                let server = client.guilds.get(config.serverID);
                                                //get the role for that particular server based on ID. ServerID and RoleID can be found in the Discord App itself. These ID's are saved in config.json file
                                                let role = server.roles.get(config.roleID);

                                                // the user has to be converted into a guild member before we can assign a new role
                                                server.fetchMember(message.author).then(member => {
                                                    // we can only add roles to members, not users (API objects)
                                                    member.addRole(role);

                                                    // we want to give feedback to the user so that they know the command worked
                                                    // by using an embed again, the message looks neater
                                                    message.reply("", {
                                                        embed: {
                                                            author: {
                                                                name: "Success"
                                                            },

                                                            color: 3066993, // the colour code for green
                                                            description: "You have been successfully assigned your new role of Alpha user.",

                                                        }
                                                    });
                                                });
                                            } else {
                                                message.reply("It appears there are no more steamkeys left in the database. If you feel this is a error, please contact the Admin");
                                            }
                                        });
                                    } else {
                                        message.reply("This validation code has been used. If this is a error contact the Admin");
                                    }
                                }
                            });
                            tempConnection.release();
                        };
                    });

                };
            };
        } else {
            message.reply("Couldn't find your validation code in the database. Please contact an Administrator"); //If a validation code wasn't entered
        };
    };
});


client.login(config.token);
