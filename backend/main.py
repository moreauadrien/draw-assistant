import json
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from mistralai import Mistral
import os
from jsonschema import validate
import utils

load_dotenv()

api_key = os.getenv("MISTRAL_TOKEN")
if api_key is None:
    print("Invalid Mistral Token")
    exit(1)

model = "ministral-3b-2410"
model = "mistral-large-latest"

client = Mistral(api_key=api_key)


class Prompt(BaseModel):
    prompt: str
    current_canvas: str
    width: int
    height: int


app = FastAPI()

api = APIRouter(prefix="/api")


@api.post("")
@api.post("/")
async def prompt_to_draw(prompt: Prompt):
    try:
        shapes = json.loads(prompt.current_canvas)
        validate(instance=shapes, schema=utils.shape_schema)
    except:
        raise HTTPException(status_code=400, detail="Invalid current_canvas")

    chat_response = client.chat.complete(
        model = model,
        messages = [
            {
                "role": "system",
                "content": utils.build_shape_prompt(prompt.width, prompt.height, prompt.current_canvas),
            },
            {
                "role": "user",
                "content": prompt.prompt,
            },
        ]
    )

    resp = chat_response.choices[0].message.content

    if isinstance(resp, str):
        shapes = json.loads(resp)
        try:
            validate(instance=shapes, schema=utils.shape_schema)
            return shapes
        except:
            raise HTTPException(status_code=500, detail="Internal error")

    raise HTTPException(status_code=500, detail="Internal error")

app.include_router(api)

app.mount("/", StaticFiles(directory="dist", html=True), name="spa")
