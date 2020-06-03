//Imports
const Discord = require('discord.js');
const KeyV = require('keyv');
const { prefix, token } = require('./config.json');

//const objs
const client = new Discord.Client();
const storageClient = new KeyV();
// readd sql later: 'sqlite:storedPoints.sqlite'

//Var Dict
var pointsCurrentlyBet = {};
var pointsEarnedOverLifetime = {};

//Client stuff
client.on('ready', ()=>{
    console.log('BetBot loading house cheats...');
})

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	const username = message.author.username;

	if (command === 'bet') {
		const value = message.content.slice(prefix.length + command.length + 1);
		const pointValue = parseFloat(value);
		if(isNaN(pointValue)) return;
		await storageClient.set(`${message.author.id}_betting`, pointValue);
		return message.channel.send(`${username} has bet ${value} imaginary points.`);
	} else if (command === 'win'|| command === 'won') {
		const addedPoints = await storageClient.get(`${message.author.id}_betting`);
		var currPoints = 0;
		try {
			currPoints = await storageClient.get(`${message.author.id}_current`);
		} catch (error) {}
		if(currPoints == undefined) currPoints = 0;
		await storageClient.set(`${message.author.id}_current`, currPoints + addedPoints);
		await storageClient.set(`${message.author.id}_betting`, 0);
		return message.channel.send(`${username} has won! total points lifetime ${currPoints + addedPoints}`);
	} else if(command === 'lose'|| command === 'lost') {
		const lostPoints = await storageClient.get(`${message.author.id}_betting`);
		var currPoints = 0;
		try {
			currPoints = await storageClient.get(`${message.author.id}_current`);
		} catch (error) {}
		if(currPoints == undefined) currPoints = 0;
		await storageClient.set(`${message.author.id}_current`, currPoints - lostPoints);
		await storageClient.set(`${message.author.id}_betting`, 0);
		return message.channel.send(`${username} has lost! total points lifetime ${currPoints - lostPoints}`);
	} else if(command === 'help') {
		return message.channel.send('Prefix is \~\~ \n Following Commands are available:\n\t bet <amount to bet> : enters and sets your bet \n\t win : denotes a win and awards you points \n\t lose : denotes a loss and subtracts points')
	}
})

client.login(process.env.CLIENT_TOKEN);

//keyv
storageClient.on('error', err => console.error('Keyv connection error:', err));
