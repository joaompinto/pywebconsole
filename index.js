document.addEventListener('DOMContentLoaded', async () => {
    const consoleElement = document.querySelector('web-console');
    
    // Setup console appearance
    consoleElement
        .setPromptSymbol('> ')
        .setPlaceholder('Type a message and press enter')
        .setTimestamps(false);
    
    // First set up the command handler
    consoleElement.onCommand(async (command) => {
        try {
            const response = await fetch('http://localhost:8000/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ command: command }),
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                consoleElement.printMessage(data.result, 'message-error');
            } else {
                consoleElement.printMessage(data.result);
            }
        } catch (error) {
            console.error('Error:', error);
            consoleElement.printMessage(`Error: ${error.message}`, 'message-error');
        }
    });

    // Print initial system message with markdown
    consoleElement.printSystemMessage(
        'Python Web Console',
        '# Quick Guide\n\n' +
        '* Commands are executed on the server\n' +
        '* Press `↑`/`↓` to navigate command history'
    );

    // Fetch and display the welcome message from Welcome.md
    try {
        const response = await fetch('Welcome.md');
        if (!response.ok) {
            throw new Error(`Failed to load welcome message: ${response.status}`);
        }
        const markdown = await response.text();
        consoleElement.printSystemMessage(markdown);
    } catch (error) {
        console.error('Error:', error);
        consoleElement.printMessage(`Error: ${error.message}`, 'message-error');
    }
});