const RiotRequest = require('riot-lol-api');

const apiKey = process.argv[2]; // the 3rd argument passed to node
const queue = process.argv[3];
const gameType = process.argv[4];
if (!apiKey) {
  console.error("❌ Please provide your Riot API key as a command-line argument.");
  process.exit(1);
}

const riotRequest = new RiotRequest(apiKey); // Replace with your real Riot API key

const platform = 'euw1';
const region = 'europe'; // Used for match-v5
const tiers = ['SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'];
const divisions = ['IV', 'III', 'II', 'I'];

function getRandomPage() {
    return Math.floor(Math.random() * 10) + 1;
}

async function getSummonerFromRank(tier, division, count) {
    return new Promise((resolve, reject) => {
        const endpoint = `/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${getRandomPage()}`;
        riotRequest.request(platform, 'league', endpoint, (err, data) => {
            if (err || !data.length) {
                return reject(err || 'No summoners found');      
            }

            puuids = [] 
            for (let i = 0; i < count; i++) {
                puuids.push(data[i].puuid)
            }

            resolve(puuids);
        });
    });
}

async function getMostRecentMatch(puuid, count, startTime, queue, gameType) {
    return new Promise((resolve, reject) => {
        const endpoint = `/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queue}&startTime=${startTime}&count=${count}&type=${gameType}`;
        riotRequest.request(region, 'match', endpoint, (err, data) => {
            if (err || !data.length) {
                return reject(err || 'No match found');
            } 
        resolve(data); // Match ID
        });
    });
}

async function getMatchDetails(matchId) {
  return new Promise((resolve, reject) => {
    const endpoint = `/lol/match/v5/matches/${matchId}`;
    riotRequest.request(region, 'match', endpoint, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

(async () => {
    const matchList = []
    let counter = 0 
    for (const tier of tiers) {
        for (const division of divisions) {
            try {
                console.log(`\n=== ${tier} ${division} ===`);
                let puuids = await getSummonerFromRank(tier, division, 5);
                for (let j=0; j < puuids.length; j++) {
                    let puuid = puuids[j]
                    let matchIds = await getMostRecentMatch(puuid, 1, "17356921", queue, gameType); 

                    for (let i = 0; i < matchIds.length; i++) {
                        let matchId = matchIds[i]
    
                        let match = await getMatchDetails(matchId);
                        let matchInfo = {}
    
                        let info = match.info; 
                        let gameStartTime = info.gameStartTimestamp; 
                        let gameId = info.gameId; 
                        let blueWins = info.teams[0].win
                        let draft = []
                        let summonerNames = []
    
                        for (let k = 0; k < info.participants.length; k++) {
                            p = info.participants[k]
                            draft.push(p.championName)
                            summonerNames.push(p.riotIdGameName + "#" + p.riotIdTagline) 
                        }
                        
                        matchInfo["gameId"] = gameId 
                        matchInfo["gameStartTime"] = gameStartTime 
                        matchInfo["draft"] = draft 
                        matchInfo["blueWins"] = blueWins
                        matchInfo["counter"] = counter
                        matchInfo["summonerNames"] = summonerNames
    
                        matchList.push(matchInfo)
                        counter += 1 
                        console.log(matchInfo)
                    }
                }

                console.log(`Successlly got ${matchInfo.length} matches`)

            } catch (err) {
                console.error(`Error for ${tier} ${division}:`, err?.message || err);
            }
        }
    }
})();
