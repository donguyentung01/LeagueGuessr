from fastapi import FastAPI, Depends, HTTPException, status, Header, Body, Query
from sqlalchemy import func, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal, engine
from models import Base, GameData, Prediction, User, Token, TokenData, UserCreate, GamePlayer, AnonUser, UpdateScoreRequest, RoomGame, RoomUserScore
from models import UserOut, PredictionOut, GameDataOut, HiddenGameDataOut, GamePlayerOut, HiddenGamePlayerOut, AnonUserOut, RoomGameOut, RoomUserScoreOut
from models import convertUsertoUserOut, convertGameDataToGameDataOut, convertGameDataToHiddenGameDataOut, convertGamePlayerToGamePlayerOut, convertGamePlayerToHiddenGamePlayerOut, convertAnonUserToAnonUserOut
from models import convertRoomGameToRoomGameOut, convertRoomUserScoreToRoomUserScoreOut
from models import RecordScore, RecordOut
from sqlalchemy.future import select
from typing import Annotated, Optional, List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from uuid import uuid4
from profanity import profanity
import random
import string

load_dotenv() 

app = FastAPI()

# CORS cross-origin policy
origins = [
    os.getenv("ORIGIN")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],  
)

#Authentication config
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # /token is where the client gets the token

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_game_id_from_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        return payload["game_id"]
    except Exception as e:
        print("JWT decode error:", e)
        return None

# **--------set up DB-------**
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with SessionLocal() as session:
        yield session

# **---------------------------------**
#Authentication 

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def authenticate_user(username: str, password: str, db) -> User:
    user = await get_user(username, db)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[str] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token", response_model = Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)) -> Token:
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.post("/register", response_model = UserOut) 
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)) -> UserOut:
    if profanity.contains_profanity(user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inappropriate username",
        )
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    if user.password != user.reentered_password: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )
    new_user = User(
        username=user.username,
        password=get_password_hash(user.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    new_user_out = convertUsertoUserOut(new_user)
    return new_user_out

async def get_user(username: str, db) -> User:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    return user 

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception

    user = await get_user(token_data.username, db)

    if user is None:
        raise credentials_exception
    
    return user

@app.get("/users/me", response_model = UserOut)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserOut:
    user_out = convertUsertoUserOut(current_user)
    return user_out

#**-----API-----***

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/game/random", response_model=HiddenGameDataOut)
async def get_random_game(
    queue: int,
    db: AsyncSession = Depends(get_db)
) -> HiddenGameDataOut:
    result = await db.execute(
        select(GameData)
        .where(GameData.queue == queue)
        .order_by(func.random())
    )

    game_data = result.scalars().first()

    if not game_data:
        raise HTTPException(status_code=404, detail="No game found for the given queue.")

    hidden_game_data_out = convertGameDataToHiddenGameDataOut(game_data)
    return hidden_game_data_out

async def get_game_by_token(gameToken: str, db: AsyncSession) -> GameData:
    # Query to select the game with the given gameId, excluding 'blueWins' column
    decrypted_game_id = get_game_id_from_token(gameToken)
    if decrypted_game_id is None:
        # Token expired or invalid - handle as needed
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    result = await db.execute(
        select(
            GameData
        )
        .filter(GameData.game_id == decrypted_game_id)  # Filter by gameId
    )

    game = result.scalars().first()  # Get the first (and only) result

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")  # Handle if no game is found

    return game

@app.post("/prediction", response_model = PredictionOut) 
async def prediction(prediction: Prediction, db: AsyncSession = Depends(get_db), authorization: Optional[str] = Header(None)) -> PredictionOut: 
    game_data = await get_game_by_token(prediction.gameId, db)
    game_data_out = convertGameDataToGameDataOut(game_data)
    
    success = game_data.blue_wins == prediction.prediction

    out = PredictionOut(
        successful_guess = success, 
        game_data_out = game_data_out, 
    )
    return out 

@app.post("/set_record_score", response_model=RecordOut)
async def setRecordScore(data: RecordScore, db: AsyncSession = Depends(get_db), authorization: Optional[str] = Header(None)) -> RecordOut:
    current_user = None
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            try:
                current_user = await get_current_user(token, db)
            except HTTPException:
                pass  # treat as unauthenticated if token is invalid

    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    current_score = data.current_score
    queue = data.queue

    # Determine which record field to use
    if queue == 420:
        current_record = current_user.record_score_ranked
        if current_score <= current_record:
            return RecordOut(new_record=False, current_record=current_record)
        
        stmt = (
            update(User)
            .where(User.id == current_user.id)
            .values(record_score_ranked=current_score)
        )
    elif queue == 450:
        current_record = current_user.record_score
        if current_score <= current_record:
            return RecordOut(new_record=False, current_record=current_record)
        
        stmt = (
            update(User)
            .where(User.id == current_user.id)
            .values(record_score=current_score)
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid queue value")

    await db.execute(stmt)
    await db.commit()

    return RecordOut(new_record=True, current_record=current_score)


@app.get("/leaderboard", response_model=List[UserOut])
async def get_leaderboard(
    limit: int = 50,
    queue: int = 450,
    db: AsyncSession = Depends(get_db)
) -> List[UserOut]:
    if not (1 <= limit <= 100):
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    if queue == 450:
        order_by_column = User.record_score
    elif queue == 420:
        order_by_column = User.record_score_ranked
    else:
        raise HTTPException(status_code=400, detail="Unsupported queue type")

    result = await db.execute(
        select(User).order_by(desc(order_by_column)).limit(limit)
    )
    users = result.scalars().all()
    
    return [convertUsertoUserOut(user) for user in users]

@app.get("/game/{game_id}/hidden_players", response_model=List[HiddenGamePlayerOut])
async def get_players_for_game(game_id: str, db: AsyncSession = Depends(get_db)) -> List[HiddenGamePlayerOut]:
    # Query to select all players associated with the given game_id
    decrypted_game_id = get_game_id_from_token(game_id)

    result = await db.execute(
        select(GamePlayer).filter(GamePlayer.game_id == decrypted_game_id)  # Filter by game_id
    )
    
    # Get the list of GamePlayer objects
    game_players = result.scalars().all()
    
    # If no players found, raise an exception
    if not game_players:
        raise HTTPException(status_code=404, detail="Players not found for the given game_id")
    
    # Convert each GamePlayer to HiddenGamePlayerOut
    hidden_game_players_out = [convertGamePlayerToHiddenGamePlayerOut(player) for player in game_players]
    
    return hidden_game_players_out

@app.get("/game/{game_id}/players", response_model=List[GamePlayerOut])
async def get_players_for_game(game_id: str, db: AsyncSession = Depends(get_db)) -> List[GamePlayerOut]:
    # Query to select all players associated with the given game_id
    decrypted_game_id = get_game_id_from_token(game_id)

    result = await db.execute(
        select(GamePlayer).filter(GamePlayer.game_id == decrypted_game_id)  # Filter by game_id
    )
    
    # Get the list of GamePlayer objects
    game_players = result.scalars().all()
    
    # If no players found, raise an exception
    if not game_players:
        raise HTTPException(status_code=404, detail="Players not found for the given game_id")
    
    # Convert each GamePlayer to HiddenGamePlayerOut
    game_players_out = [convertGamePlayerToGamePlayerOut(player) for player in game_players]
    
    return game_players_out

@app.post("/anon_users/create", response_model=AnonUserOut)
async def create_anon_user(db: AsyncSession = Depends(get_db)) -> AnonUserOut:
    # Keep generating a new UUID until there's no collision (extremely rare)
    while True:
        random_id = str(uuid4())
        result = await db.execute(select(AnonUser).where(AnonUser.id == random_id))
        if result.scalar_one_or_none() is None:
            break  # No collision, use this ID

    # Create the AnonUser
    new_user = AnonUser(id=random_id)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return convertAnonUserToAnonUserOut(new_user)

@app.get("/anon_users/{anon_user_id}", response_model=AnonUserOut)
async def get_anon_user(
    anon_user_id: str, 
    db: AsyncSession = Depends(get_db)
) -> AnonUserOut:
    result = await db.execute(select(AnonUser).filter(AnonUser.id == anon_user_id))
    anon_user = result.scalars().first()
    if not anon_user:
        raise HTTPException(status_code=404, detail="AnonUser not found")
    return convertAnonUserToAnonUserOut(anon_user)

@app.post("/anon_users/update_score")
async def update_anon_user_score(
    data: UpdateScoreRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        update(AnonUser)
        .where(AnonUser.id == data.anon_user_id)
        .values(
            guesses=AnonUser.guesses + 1,
            correct_guesses=AnonUser.correct_guesses + (1 if data.correct else 0)
        )
    )
    await db.execute(stmt)
    await db.commit()
    return {"status": "success"}

# create challenge
def generate_challenge_code(length: int = 6) -> str:
    characters = string.ascii_lowercase + string.digits
    return ''.join(random.choices(characters, k=length))

async def room_id_exists(db: AsyncSession, room_id: str) -> bool:
    result = await db.execute(
        select(RoomGame).where(RoomGame.room_id == room_id)
    )
    return result.scalars().first() is not None

@app.post("/room/create", response_model=List[RoomGameOut])
async def create_room(
    db: AsyncSession = Depends(get_db)
) -> List[RoomGameOut]:
    result = await db.execute(
        select(GameData.game_id)
        .order_by(func.random())
        .limit(10)
    )

    game_ids = result.scalars().all()

    room_id = generate_challenge_code() 
    while not room_id_exists(db, room_id): 
        room_id = generate_challenge_code() 

    output = []
    for game_id in game_ids: 
        room_game = RoomGame(
            room_id = room_id, 
            game_id = game_id 
        )
        db.add(room_game)
        await db.flush()  # flush to get generated id
        output.append(convertRoomGameToRoomGameOut(room_game))
    await db.commit()

    return output 

@app.get("/room/{room_id}", response_model = List[RoomGameOut])
async def get_room(
    room_id: str, 
    db: AsyncSession = Depends(get_db)
) -> List[RoomGameOut]:
    result = await db.execute(
        select(RoomGame)
        .filter(RoomGame.room_id == room_id)
        .limit(10)
    )

    room_games = result.scalars().all() 

    if not room_games:
        raise HTTPException(status_code=404, detail="Room not found")
    output = [] 
    for room_game in room_games: 
        output.append(convertRoomGameToRoomGameOut(room_game))
    return output 