from fastapi import FastAPI , HTTPException
from pydantic import BaseModel , Field
from typing import List , Optional
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # <--- important
    allow_headers=["*"],  # <--- important
)

class Todo(BaseModel):
    id:Optional[str] = None
    user_id:str
    text:str
    # completed:bool = Field(default=False)

class User(BaseModel):
    user_id:str
    email:str
    todos: List[Todo] = [] # here i defined that list is of type todo

def load_data():
    with open("data.json" , "r") as f:
        data = json.load(f)
    return data


def save_data(data):
    with open("data.json", "w") as f:
        json.dump(data, f)



@app.get("/")
def home():
    return {"message":"hello world"}

@app.get("/user")
def get_or_create_user(user_id: str, email: str):
    data = load_data()
    print(data)
    for user in data["users"]:
        if(user["user_id"] == user_id):
            return user
        
    new_user = User(user_id=user_id , email=email)
    data["users"].append(new_user.model_dump())
    save_data(data)
    return new_user

@app.post("/create")
def create_todo(todo:Todo):
    data = load_data()
    if not todo.user_id:
        raise HTTPException(status_code=404 , detail = "user not found")
    for user in data["users"]:
        if(user["user_id"] == todo.user_id):
            new_todo={
                "id":len(user["todos"])+1,
                "text":todo.text,
                # "completed":todo.completed
            }
            user["todos"].append(new_todo)
            save_data(data)
            return {"message": "Todo added successfully", "todo": new_todo}
        
    raise HTTPException(status_code=404, detail="User not found")



