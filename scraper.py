import requests
import random
import time
import argparse

def get_random_summoners(tier, division, count=1, api_key=""):
    REGION = "na1"
    url = f"https://{REGION}.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/{tier}/{division}?page=1"
    headers = {"X-Riot-Token": api_key}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch summoners for {tier} {division}")
        return []
    players = response.json()
    return random.sample(players, min(count, len(players)))

def get_puuid(summoner_name, api_key=""):
    REGION = "na1"
    url = f"https://{REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}"
    headers = {"X-Riot-Token": api_key}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to get PUUID for {summoner_name}")
        return None
    return response.json().get("puuid")

def get_recent_matches(puuid, count=1, api_key=""):
    MATCH_REGION = "americas"
    url = f"https://{MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?count={count}"
    headers = {"X-Riot-Token": api_key}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to get matches for {puuid}")
        return []
    return response.json()

def get_match_details(match_id, api_key=""):
    MATCH_REGION = "americas"
    url = f"https://{MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": api_key}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to get details for match {match_id}")
        return None
    output = {}
    output["draft"] = []
    infoDto = response.json()['info'] 
    for p in infoDto['participants']: 
        output["draft"].append(p['championName']) 
    output["gameStartTime"] = infoDto["gameStartTimestamp"] 
    output["gameId"] = infoDto["gameId"] 
    output["result"] = infoDto["teams"][0]["win"] 
    return output  

def main(api_key):
    RANK_TIERS = [
        ("IRON", "I"), ("IRON", "II"), ("IRON", "III"), ("IRON", "IV"),
        ("BRONZE", "I"), ("BRONZE", "II"), ("BRONZE", "III"), ("BRONZE", "IV"),
        ("SILVER", "I"), ("SILVER", "II"), ("SILVER", "III"), ("SILVER", "IV"),
        ("GOLD", "I"), ("GOLD", "II"), ("GOLD", "III"), ("GOLD", "IV"),
        ("PLATINUM", "I"), ("PLATINUM", "II"), ("PLATINUM", "III"), ("PLATINUM", "IV"),
        ("EMERALD", "I"), ("EMERALD", "II"), ("EMERALD", "III"), ("EMERALD", "IV"),
        ("DIAMOND", "I"), ("DIAMOND", "II"), ("DIAMOND", "III"), ("DIAMOND", "IV"),
        ("MASTER", "I"),
        ("GRANDMASTER", "I"),
        ("CHALLENGER", "I")
    ]

    all_matches = []
    game_count = 0
    for tier, division in RANK_TIERS:
        print(f"\nProcessing {tier} {division}...")
        summoners = get_random_summoners(tier, division, api_key=api_key)

        for summoner in summoners:
            puuid = summoner['puuid']

            match_ids = get_recent_matches(puuid, api_key=api_key)
            matches = [get_match_details(mid, api_key=api_key) for mid in match_ids]
            for match in matches:
                all_matches.append(match) 

            time.sleep(1.2)  # Sleep to avoid rate limit

    print("\nFinished collecting match data.")
    print(all_matches)

if __name__ == "__main__":
    # Set up argument parser for command-line input
    parser = argparse.ArgumentParser(description="Fetch League of Legends player data using the Riot API.")
    parser.add_argument('api_key', help="Your Riot API Key")
    args = parser.parse_args()

    main(args.api_key)
