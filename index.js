//const config = require("./config.json");

const Vimm = require("vimm-chat-lib");
const chalk = require('chalk');
const clear = require('clear');
const fetch = require('node-fetch');
const request = require("request");
var util = require('util');
var nconf = require('nconf');
const { time } = require("console");
const { connect } = require("http2");

nconf.use('global', {type: 'file', file: './config.json' });
nconf.load();

// const chat = new Vimm.VimmChat({
//     token: nconf.get().vimmtv.token,
//     debug: true // Outputs heartbeat logs if true.
// });

console.log(`
${chalk.grey('--------------------------------------------------')}
${chalk.yellow('              Welcome to StarBot! ')}
${chalk.yellow('    This is the official chat bot for VIMM ')}
${chalk.grey('--------------------------------------------------')}
`);


    function Connect(channel) {
        var chat = new Vimm.VimmChat({
            token: nconf.get().vimmtv.token,
            debug: true // Outputs heartbeat logs if true.
        });

        chat.connect(channel).then(meta => {
			
            //console.log(meta)
            
            chat.on("message", async msg => {
                
                //if (msg.roles[0].bot == true) return
                if (msg.chatter == "StarBot") return
                //if (!nconf.get().vimmtv.connect.includes(msg.channel)) return

                if (msg.message.includes('Upvote from')) {
                    if (msg.chatter == "vimm") {
                    	var upvoteString = msg.message.split('Upvote from ').pop();
                    	var upvoter = upvoteString.substring(0, upvoteString.indexOf('!'));
                    	chat.sendMessage(msg.channel, `${upvoter} just upvoted!`)
                	}
                }
                
                if(msg.message.includes('just subscribed')) {
                    if (msg.chatter == "vimm") {
                    	var subscriber = msg.message.substr(0, msg.message.indexOf(' '));
                    	chat.sendMessage(msg.channel, `${subscriber} just subscribed!`)
                    } 
                }
                
                //COMMANDS HERE                
                const prefix = "!";
                if (msg.message.toLowerCase().indexOf(prefix.toLowerCase()) !== 0) return;
                const args = msg.message.slice(prefix.length).split(/ +/g);
                const command = args.shift().toLowerCase()
                
                if (command == "hello") {
                    
                    chat.sendMessage(msg.channel, `HI THERE`)
                    
                }
                
                if (command == "title") {
                    
                    chat.getTitle(msg.channel);
                    
                }
                
                if (command == "join") {
                    
                    if (msg.channel == "starbot") {
                        if (!nconf.get().vimmtv.connect.includes(msg.chatter)) {
                            chat.sendMessage(msg.channel, `I have Joined @${msg.chatter}. For my functionalities to work, please use the link in my BIO to authorize me. :vimm:`)
                            nconf.get().vimmtv.connect.push(msg.chatter)
                            nconf.save(function (err) {
                                if (err) {
                                    console.error(err.message)
                                    return
                                }
                                console.log(chalk.greenBright('Configuration saved successfully.'))
                            });
                            chat.connect([msg.chatter])
                        } else {
                            chat.sendMessage(msg.channel, `Hey @${msg.chatter}, it looks like I'm already in your chat.`)
                        }
                    }
                    
                }
                
                if (command == "part") {
                    if (msg.roles[0].broadcaster == true) {
                        for( var i = 0; i < nconf.get().vimmtv.connect.length; i++){ 
    
                            if ( nconf.get().vimmtv.connect[i] === msg.channel) { 
                        
                                nconf.get().vimmtv.connect.splice(i, 1); 
                            }
                        
                        }
                        nconf.save(function (err) {
                            if (err) {
                                console.error(err.message);
                                return;
                            }
                            console.log(chalk.greenBright('Configuration saved successfully.'));
                        });
                        chat.sendMessage(msg.channel, `Alright @${msg.chatter}, I'm leaving. If you ever want to invite me again, go to my channel: https://www.vimm.tv/c/starbot`)
                        chat.close()
                    }
                }

                // if (command == "close") {
                //     if (msg.roles[0].broadcaster == true) {
                //         chat.close()
                //     }
                // }
				
				if (command == "game") {
                    
                    chat.getGame(msg.channel)
                    
                }
                
                if (command == "settitle") {
                    
                    if (msg.roles[0].broadcaster == true) {
                    
                        chat.setTitle(msg.channel, msg.message.replace("!settitle ",""))
                        
                	} else {
                        
                        chat.sendMessage(msg.channel, `You don't have access to this command.`)
                        
                    }
                    
                }
                
                if (command == "setgame") {
                    
                    if (msg.roles[0].broadcaster == true) {
                    
                        chat.setGame(msg.channel, msg.message.replace("!setgame ",""))
                        
                	} else {
                        
                        chat.sendMessage(msg.channel, `You don't have access to this command.`)
                        
                    }
                    
                }

                if (command == "setdiscord") {
                    
                    if (msg.roles[0].broadcaster == true) {
                        nconf.set(`users:${msg.channel}:discord`, args[0])
                        nconf.save(function (err) {
                            if (err) {
                                console.error(err.message)
                                return
                            }
                            console.log(chalk.greenBright('User configs saved successfully.'))
                        });
                	} else {
                        
                        chat.sendMessage(msg.channel, `You don't have access to this command.`)
                        
                    }
                    
                }

                if (command == "discord") {
                    if (nconf.get(`users:${msg.channel}:discord`)) {
                        chat.sendMessage(msg.channel, "Join the Discord: "+nconf.get(`users:${msg.channel}:discord`))
                    } else {
                        chat.sendMessage(msg.channel, `@${msg.channel} does not have a Discord server...`)
                    }
                    
                }
                
                if (command == "ban") {
                    
                	if (msg.roles[0].broadcaster == true || msg.roles[0].moderators == true) {
                    
                        chat.ban(msg.channel, args[0])
                        
                	} else {
                        
                        chat.sendMessage(msg.channel, `You don't have access to this command.`)
                        
                    }
                }
                
                if (command == "unban") {
                    
                	if (msg.roles[0].broadcaster == true || msg.roles[0].moderators == true) {
                    
                        chat.unban(msg.channel, args[0])
                        
                	} else {
                        
                        chat.sendMessage(msg.channel, `You don't have access to this command.`)
                        
                    }
                }

            })

            chat.on("close", event => {

                console.log(event)

                // if(event == 1005){ // Uncomment these lines if you want to test out the reconnect function with !close command.

                // 	chat.connect([channel])

                // }

                // if (event == 1006) {

                //     chat.connect(nconf.get().vimmtv.connect) // If Abnormal disconnect (1006), Glimesh Bot reconnects.

                // }
            })

        })

    }

    nconf.get().vimmtv.connect.forEach( function (channel, index) {
        setTimeout(function(){Connect([channel])}, 501 * index)
    })
    //Connect(nconf.get().vimmtv.connect)