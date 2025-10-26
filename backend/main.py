from fastapi import FastAPI
from pydantic import BaseModel , Field
from typing import List


class Todo(BaseModel):
    id:str
    text:str
    completed:bool = Field(default=False)

class User(BaseModel):
    user_id:str
    email:str
    todos: List[Todo] # here i defined that list is of type todo

app = FastAPI()

@app.get("/")
def home():
    return {"message":"hello world"}