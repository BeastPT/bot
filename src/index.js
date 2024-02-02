require('dotenv').config();
const { inspect } = require('util');

const Logger = require('leekslazylogger');
const logger_options = require('./logger/options');
const log = new Logger(logger_options);

log.info.manager('Shard manager is starting');

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./src/bot.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
	errorFormat: 'pretty',
	log: [
		{
			emit: 'event',
			level: 'query'
		},
		{
			emit: 'event',
			level: 'info'
		},
		{
			emit: 'event',
			level: 'warn'
		},
		{
			emit: 'event',
			level: 'error'
		}
	]
});

prisma.$on('query', e => log.debug.manager(e));
prisma.$on('info', e => log.verbose.manager(e));
prisma.$on('warn', e => log.warn.manager(e));
prisma.$on('error', e => log.critical.manager(e));

manager.on('shardCreate', shard => {
	log.info.manager(`Launched shard ${shard.id}`);
	logger_options.namespaces = [...logger_options.namespaces, `shard${shard.id}`];
	log.options = logger_options;
	shard.on('message', message => {
		if (message.level && message.content) {
			log[message.level]['shard' + shard.id](message.content);
		}
	});
});

manager.spawn().then(async shards => {
	// logging
	log.success.manager(`Spawned ${shards.size} shards`);
});

process.on('unhandledRejection', error => {
	log.notice.manager('An error was not caught');
	const name = inspect(error)?.match(/PrismaClient(KnownRequest|Initialization)Error/)?.[0];
	if (name) log.critical.manager(name);
	log.error.manager(error);
});

/** FOR JSDOC TYPES, NOT FOR IMPORTING */
module.exports = {
	log,
	manager,
	prisma
};