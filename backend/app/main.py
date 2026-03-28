# FastAPI is a Python class that provides all the functionality for your API.
# FastAPI is a class that inherits directly from Starlette.
from fastapi import FastAPI

# Create a FastAPI instance 
# This will be the main point of interaction to create all your API.

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}