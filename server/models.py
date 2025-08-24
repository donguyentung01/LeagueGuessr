from sqlalchemy import Column, Integer, String, BigInteger, Boolean
from database import Base
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os 
from datetime import datetime, timedelta
import jwt

load_dotenv() 
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def generate_game_token(game_id):
    payload = {
        "game_id": game_id,
        "exp": datetime.utcnow() + timedelta(minutes=5)  # expires in 5 minutes
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

class GameData(Base):
    __tablename__ = 'game'

    game_id = Column(String(255), primary_key=True, index=True) 
    game_start_time = Column(BigInteger, nullable=True)        
    game_length_seconds = Column(Integer, nullable=True)        
    game_patch = Column(String(20), nullable=True)      
    blue_wins = Column(Boolean, nullable=True) 
    rank = Column(String(50), nullable=True) 
    queue = Column(Integer, nullable=True)  

class GameDataOut(BaseModel):
    game_id: str
    game_start_time: Optional[int] = None
    game_length_seconds: Optional[int] = None
    game_patch: Optional[str] = None
    blue_wins: Optional[bool] = None
    rank: Optional[str] = None
    queue: Optional[int] = None

    class Config:
        from_attributes=True

class GamePlayer(Base):
    __tablename__ = 'game_players'

    id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(String(255), nullable=False)
    player_index = Column(Integer, nullable=False)
    summoner_name = Column(String(255), nullable=True)
    champion_name = Column(String(255), nullable=True)
    team = Column(String(10), nullable=True)

    kills = Column(Integer, nullable=True)
    deaths = Column(Integer, nullable=True)
    assists = Column(Integer, nullable=True)

    spell1 = Column(String(50), nullable=True)
    spell2 = Column(String(50), nullable=True)

    primary_rune = Column(String(100), nullable=True)
    secondary_rune = Column(String(100), nullable=True)

    item0 = Column(Integer, nullable=True)
    item1 = Column(Integer, nullable=True)
    item2 = Column(Integer, nullable=True)
    item3 = Column(Integer, nullable=True)
    item4 = Column(Integer, nullable=True)
    item5 = Column(Integer, nullable=True)
    item6 = Column(Integer, nullable=True)

    damage_dealt = Column(Integer, nullable=True)
    damage_taken = Column(Integer, nullable=True)

class GamePlayerOut(BaseModel):
    id: int
    game_id: str
    player_index: int
    summoner_name: Optional[str] = None
    champion_name: Optional[str] = None
    team: Optional[str] = None

    kills: Optional[int] = None
    deaths: Optional[int] = None
    assists: Optional[int] = None

    spell1: Optional[str] = None
    spell2: Optional[str] = None

    primary_rune: Optional[str] = None
    secondary_rune: Optional[str] = None

    item0: Optional[int] = None
    item1: Optional[int] = None
    item2: Optional[int] = None
    item3: Optional[int] = None
    item4: Optional[int] = None
    item5: Optional[int] = None
    item6: Optional[int] = None

    damage_dealt: Optional[int] = None
    damage_taken: Optional[int] = None

    class Config:
        from_attributes=True

class HiddenGamePlayerOut(BaseModel):
    id: int
    game_id: str
    player_index: int
    champion_name: str
    team: str
    spell1: str
    spell2: str
    primary_rune: str
    secondary_rune: str

    class Config:
        from_attributes=True
    

class HiddenGameDataOut(BaseModel): 
    game_id: str
    game_length_seconds: Optional[int] = None
    game_patch: Optional[str] = None
    rank: Optional[str] = None
    queue: Optional[int] = None

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    current_score = Column(Integer, default=0) 
    current_score_ranked = Column(Integer, default=0) 
    record_score = Column(Integer, default=0)
    record_score_ranked = Column(Integer, default=0)

class Prediction(BaseModel):
    gameId: str
    anon_user_id: str
    prediction: bool
    queue: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    reentered_password: str

class UserOut(BaseModel):
    username: str
    record_score: int = 0 
    record_score_ranked: int = 0

class PredictionOut(BaseModel): 
    successful_guess: bool 
    game_data_out: GameDataOut

class RecordScore(BaseModel):
    queue: int 

class RecordOut(BaseModel):
    new_record: bool
    current_record: int

class AnonUser(Base):
    __tablename__ = 'anon_users'

    id = Column(String(255), primary_key=True, index=True)      
    guesses = Column(Integer, nullable=True, default=0)        
    correct_guesses = Column(Integer, nullable=True, default=0)       

class AnonUserOut(BaseModel):
    id: str
    guesses: int
    correct_guesses: int

    class Config:
        from_attributes=True

class UpdateScoreRequest(BaseModel):
    anon_user_id: str
    correct: bool

class RoomGame(Base):
    __tablename__ = 'room_game' 

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String(255))
    game_id = Column(String(255))

class RoomGameOut(BaseModel): 
    id: int
    room_id : str
    game_id : str

class RoomUserScore(Base):
    __tablename__ = 'room_user_score' 

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String(255))
    user = Column(String(255))
    score = Column(Integer)

class RoomUserScoreOut(BaseModel):
    id: int
    room_id : str
    user : str
    score : int

    class Config:
        from_attributes=True

def convertUsertoUserOut(user: User) -> UserOut: 
    user_out = UserOut(
        username = user.username, 
        record_score = user.record_score, 
        record_score_ranked = user.record_score_ranked
    )
    return user_out

def convertGameDataToGameDataOut(game_data: GameData) -> GameDataOut:
    return GameDataOut.from_orm(game_data)

def convertGameDataToHiddenGameDataOut(game_data: GameData) -> HiddenGameDataOut:
    return HiddenGameDataOut(
        game_id=generate_game_token(game_data.game_id),
        game_length_seconds=game_data.game_length_seconds,
        game_patch=game_data.game_patch,
        rank = game_data.rank,
        queue = game_data.queue
    )

def convertGamePlayerToGamePlayerOut(game_player: GamePlayer) -> GamePlayerOut:
    return GamePlayerOut.from_orm(game_player)

def convertGamePlayerToHiddenGamePlayerOut(game_player: GamePlayer) -> HiddenGamePlayerOut:
    return HiddenGamePlayerOut(
        id=game_player.id,
        game_id=generate_game_token(game_player.game_id),
        player_index=game_player.player_index,
        champion_name=game_player.champion_name,
        team=game_player.team,
        spell1=game_player.spell1,
        spell2=game_player.spell2,
        primary_rune=game_player.primary_rune,
        secondary_rune=game_player.secondary_rune
    )

def convertAnonUserToAnonUserOut(anon_user: AnonUser) -> AnonUserOut:
    return AnonUserOut.from_orm(anon_user)

def convertRoomGameToRoomGameOut(room_game: RoomGame) -> RoomGameOut:
    return RoomGameOut(
        id = room_game.id, 
        room_id = room_game.room_id,  
        game_id = generate_game_token(room_game.game_id)
    )

def convertRoomUserScoreToRoomUserScoreOut(room_user_score: RoomUserScore) -> RoomUserScoreOut:
    return RoomUserScoreOut.from_orm(room_user_score)

