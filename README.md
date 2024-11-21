
This guide explains how to test the PyWebConsole application using FastAPI.

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## Installation

1. Clone this repository
2. Install required packages:
```bash
pip install fastapi uvicorn
```

## Running the Application

1. Start the FastAPI server:
```bash
uvicorn main:app --reload
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

## Testing the Console

1. Basic Operations:
   - Type `print("Hello World")` and press Enter
   - Try basic math: `2 + 2`
   - Test string operations: `"python".upper()`

2. Console Features:
   - Use Up/Down arrows to navigate command history
   - Click the "Clear Console" button to clear output
   - Try expanding/collapsing detailed messages

3. Error Handling:
   - Test invalid Python syntax
   - Try undefined variables
   - Test server connection by stopping/starting the FastAPI server

## Troubleshooting

- If console doesn't connect, ensure FastAPI server is running
- Check browser console for JavaScript errors
- Verify CORS settings if making changes to server configuration

## API Endpoints

The FastAPI backend exposes:
- POST `/execute` - Executes Python commands
- GET `/` - Serves the web console interface
