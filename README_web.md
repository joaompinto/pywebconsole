
## Overview
The web console is a customizable interactive command-line interface that can be embedded in any HTML page.

## Installation
Add these scripts to your HTML:

```html
<!-- Add marked.js for markdown support -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<!-- Add the console component -->
<script src="console.js"></script>
```

## Basic Usage
Add the console element to your HTML:

```html
<web-console></web-console>
```

## Features

### Console Methods
- `setPromptSymbol(symbol)`: Change the prompt symbol (default: '> ')
- `setPlaceholder(text)`: Set input placeholder text
- `setTimestamps(enabled)`: Toggle timestamp display
- `printMessage(text, className, detailedMessage)`: Print text to console
- `printMarkdown(markdown)`: Print markdown-formatted text
- `onCommand(callback)`: Set command handler

### Keyboard Shortcuts
- `↑`: Previous command in history
- `↓`: Next command in history
- `Enter`: Execute command

### Styling
The console uses a dark theme by default and is responsive across different screen sizes.

### Example Setup

```javascript
const console = document.querySelector('web-console');

console
    .setPromptSymbol('$ ')
    .setPlaceholder('Type a command...')
    .setTimestamps(true)
    .onCommand(command => {
        // Handle command here
        console.printMessage(`Executed: ${command}`);
    });
```

## Customization
The console supports different message types:
- Regular messages
- System messages (blue)
- Error messages (red)
- Command messages (green)

You can clear the console using the "Clear Console" button at the top.