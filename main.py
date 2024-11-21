import logging
import os
import sys
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import StringIO

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Command(BaseModel):
    command: str

@app.post("/execute")
async def execute_command(command: Command):
    logging.info(f'Received command: {command.command}')
    old_stdout = sys.stdout
    redirected_output = sys.stdout = StringIO()
    error = False
    try:
        # Split the command into lines and execute each line
        lines = command.command.split('\n')
        for line in lines[:-1]:
            exec(line)
        # Evaluate the last line
        result = eval(lines[-1])
        if result is not None:
            print(result)
    except Exception as e:
        error = True
        logging.error(f'Error executing command: {e}')
        print(e)
    sys.stdout = old_stdout
    result = redirected_output.getvalue()
    return {"result": result, "error": error}

@app.get("/favicon.ico")
async def get_favicon():
    return Response(content=b"", media_type="image/x-icon")

# Mount static files last
static_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# Run me with: 
#   uvicorn main:app --reload