import { ApiClient, HelixClip } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';
import Embed from './utils/maker';
import logger from './utils/logger';

const clientId = '';
const clientSecret = '';
const webhook = '';
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const data: { live: boolean, clips: string[] } = { live: false, clips: []};

async function isStreamLive(userName: string) {
	const user = await apiClient.helix.users.getUserByName(userName);
	if (!user) {
		return false;
	}
	return await user.getStream() !== null;
}

async function getAllClipsForBroadcaster(userId: string) {
	const request = apiClient.helix.clips.getClipsForBroadcasterPaginated(userId);

	return request.getAll();
}

const statusUpdate = (live: boolean) => {
	return live ?
	new Embed('NEESHAT LIVE')
		.setColor('#af7ac5')
		.setTimestamp()
		.setFooter("OPTIFIY")
		.send(webhook)
	:
	new Embed('NEESHAT OFFLINE')
		.setColor('#f1948a')
		.setTimestamp()
		.setFooter("OPTIFIY")
		.send(webhook);
}

const newClipHook = (clip: HelixClip) => {
	return new Embed(`NEW CLIP: ${clip.title}`, '', clip.url)
		.addField('CREATED BY', clip.creatorDisplayName)
		.setThumbnail(clip.thumbnailUrl)
		.setTimestamp()
		.setFooter("OPTIFIY")
		.send(webhook);
};

const initialize = async (): Promise<void> => {
	logger.info('Initializing');
	data.live = await isStreamLive('neeshat');
	logger.info(`LIVE: ${data.live}`);
	const clips = [];
	for ( const clip of await getAllClipsForBroadcaster('30034423')) {
		clips.push(clip.url);
	}
	data.clips = clips;
	logger.info(`Initialized: ${clips.length} clips`);
};

const monitorLive = async (): Promise<void> => {
	try {
		const live = await isStreamLive('neeshat');
		if ( live !== data.live ) {
			data.live = live;
			statusUpdate(live);
			logger.info(`LIVE status changed to ${data.live}`);
		}
	} catch (err) {
		logger.error(`Error monitoring live: ${err.message}`);
	}
};

const wait = async (ms: number): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, ms);
	})
};

const clipMonitor = async (): Promise<void> => {
	try {
		const clips = await getAllClipsForBroadcaster('30034423')
		const newClips = clips.filter(clip => !data.clips.includes(clip.url));
		if ( newClips.length > 0 ) {
			logger.info(`${newClips.length} clips found`);
			data.clips.push(...newClips.map(clip => clip.url));
			for ( const clip of newClips ) {
				newClipHook(clip);
				await wait(500);
			}
		}
	} catch (err) {
		logger.error(`Error monitoring clip: ${err.message}`)
	}
}

( async () => {
	await initialize();
	setInterval(() => {
		monitorLive();
		clipMonitor();
	}, 8000)
})();
