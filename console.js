class ConsoleElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commandCallback = null;  // Changed from _onCommand to commandCallback
        this.promptSymbol = '> ';  // Add default prompt symbol
        this.showTimestamps = false;  // Add timestamp control
        this.maxMessages = 500;  // Add max messages limit
    }

    // Method to set the command handler
    onCommand(callback) {
        this.commandCallback = callback;
        return this; // Enable chaining
    }

    // Add method to change prompt symbol
    setPromptSymbol(symbol) {
        this.promptSymbol = symbol;
        return this;
    }

    // Add method to set the input placeholder
    setPlaceholder(text) {
        this.shadowRoot.querySelector('#console-input').placeholder = text;
        return this;
    }

    // Add timestamp control method
    setTimestamps(enabled) {
        this.showTimestamps = enabled;
        return this;
    }

    connectedCallback() {
        const styles = document.createElement('style');
        styles.textContent = `
            :host {
                display: block;
                width: 90%;
                max-width: 1200px;
                min-width: 300px;
                margin: 20px auto;
                height: calc(100vh - 40px);
            }
            #console {
                width: 100%;
                height: calc(100% - 120px);
                min-height: 200px;
                background: #1e1e1e;
                color: #fff;
                padding: 10px;
                font-family: monospace;
                overflow-y: auto;
                border-radius: 4px;
                box-sizing: border-box;
            }
            @media (max-width: 600px) {
                :host {
                    width: 95%;
                    margin: 10px auto;
                    height: calc(100vh - 20px);
                }
                #console-legend {
                    display: none;
                }
            }
            #console-input {
                width: 100%;
                padding: 10px;
                margin-top: 10px;
                background: #2d2d2d;
                border: 1px solid #3d3d3d;
                color: #fff;
                font-family: monospace;
                box-sizing: border-box;
                border-radius: 4px;
            }
            #console-legend {
                margin-top: 8px;
                font-size: 12px;
                color: #666;
            }
            .shortcut {
                background: #444;
                padding: 2px 8px;
                border-radius: 3px;
                margin-right: 8px;
                font-size: 14px;
                min-width: 20px;
                display: inline-block;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                color: #fff;
            }
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #clear-console {
                margin-bottom: 10px;
                padding: 5px 10px;
                background: #333;
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            #clear-console:hover {
                background: #444;
            }
            .message-system {
                color: #88c4ff;
                font-style: italic;
            }
            .message-error {
                color: #ff8888;
            }
            .message-command {
                color: #88ff88;
            }
            .timestamp {
                color: #666;
                margin-right: 8px;
            }
            .expand-button {
                cursor: pointer;
                color: #666;
                margin-left: 8px;
                user-select: none;
            }
            .expand-button:hover {
                color: #999;
            }
            .detailed-message {
                display: none;
                margin-left: 20px;
                color: #888;
                padding: 5px;
                border-left: 2px solid #444;
                margin-top: 4px;
            }
            .detailed-message.visible {
                display: block;
            }
            .console-message {
                padding: 4px 8px;
                margin: 2px -8px;
                border-radius: 4px;
                transition: all 0.15s ease;
                border: 1px solid transparent;
            }
            .console-message:hover {
                background-color: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.1);
            }
            .markdown-content {
                line-height: 1.4;
            }
            .markdown-content p {
                margin: 0.5em 0;
            }
            .markdown-content code {
                background: #333;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .markdown-content pre {
                position: relative;
                padding: 8px;
                border-radius: 4px;
                overflow-x: auto;
                background: #2d2d2d;  // Add background color
            }
            .copy-code-button {
                position: absolute;
                top: 4px;
                right: 4px;
                padding: 4px 8px;
                background: #444;
                border: none;
                border-radius: 3px;
                color: #fff;
                font-size: 12px;
                cursor: pointer;
                z-index: 1;  // Ensure button is clickable
                opacity: 1;  // Make button always visible
            }
            .copy-code-button.copied {
                background: #2a6;
            }
            .markdown-content ul, .markdown-content ol {
                margin: 0.5em 0;
                padding-left: 2em;
            }
        `;

        this.shadowRoot.appendChild(styles);
        
        this.shadowRoot.innerHTML += `
            <button id="clear-console">Clear Console</button>
            <div id="console"></div>
            <input id="console-input" type="text" placeholder="Type a Python command and press Enter to execute">
            <div id="console-legend">
                <span class="shortcut">↑</span> Previous command &nbsp;
                <span class="shortcut">↓</span> Next command &nbsp;
                <span class="shortcut">↵</span> Execute command
            </div>
        `;

        this.consoleElement = this.shadowRoot.querySelector('#console');
        this.inputElement = this.shadowRoot.querySelector('#console-input');
        
        this.setupInputHandler();
        this.setupClearButton();
        this.inputElement.focus();

        // Add resize observer
        new ResizeObserver(() => {
            this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
        }).observe(this.consoleElement);
    }

    getTimestamp() {
        return new Date().toLocaleTimeString();
    }

    setupInputHandler() {
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const command = this.inputElement.value;
                if (command.trim()) {
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;
                    this.inputElement.value = '';
                    
                    // Use prompt symbol when showing command
                    this.printMessage(`${this.promptSymbol}${command}`, 'message-command');
                    if (this.commandCallback) {
                        this.commandCallback(command);  // Changed from _onCommand to commandCallback
                    }
                }
                this.inputElement.focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputElement.value = this.commandHistory[this.historyIndex];
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.inputElement.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    this.inputElement.value = '';
                }
            }
        });
    }

    setupClearButton() {
        this.shadowRoot.querySelector('#clear-console').addEventListener('click', () => {
            this.consoleElement.innerHTML = '';
        });
    }

    printMessage(text, className = '', detailedMessage = '', isHtml = false) {
        const output = document.createElement('div');
        output.classList.add('console-message');
        
        // Create wrapper for inline content
        const inlineContent = document.createElement('div');
        inlineContent.style.display = 'flex';
        inlineContent.style.alignItems = 'baseline';  // Align items to text baseline
        inlineContent.style.gap = '4px';  // Add small gap between elements
        
        if (this.showTimestamps) {
            const timestamp = document.createElement('span');
            timestamp.textContent = this.getTimestamp();
            timestamp.classList.add('timestamp');
            timestamp.style.flexShrink = '0';  // Prevent timestamp from shrinking
            inlineContent.appendChild(timestamp);
        }
        
        const content = document.createElement('span');
        if (isHtml) {
            content.innerHTML = text;
        } else {
            content.innerHTML = text.replace(/\n/g, '<br>');
        }
        inlineContent.appendChild(content);
        
        if (detailedMessage) {
            const expandButton = document.createElement('span');
            expandButton.textContent = ' ▼';
            expandButton.classList.add('expand-button');
            expandButton.style.flexShrink = '0';  // Prevent button from shrinking
            inlineContent.appendChild(expandButton);

            const detailsElement = document.createElement('div');
            detailsElement.classList.add('detailed-message');
            detailsElement.innerHTML = detailedMessage.replace(/\n/g, '<br>');
            
            expandButton.addEventListener('click', () => {
                detailsElement.classList.toggle('visible');
                expandButton.textContent = detailsElement.classList.contains('visible') ? ' ▲' : ' ▼';
            });
            
            output.appendChild(inlineContent);
            output.appendChild(detailsElement);
        } else {
            output.appendChild(inlineContent);
        }
        
        if (className) {
            output.classList.add(className);
        }
        output.classList.add('fade-in');
        this.consoleElement.appendChild(output);
        this.consoleElement.scrollTop = this.consoleElement.scrollHeight;

        // Remove old messages if limit is exceeded
        while (this.consoleElement.childElementCount > this.maxMessages) {
            this.consoleElement.removeChild(this.consoleElement.firstChild);
        }
    }

    // Add new method for system messages with markdown
    printSystemMessage(message, detailedMessage = '') {
        const messageHtml = marked.parse(message);
        const detailsHtml = detailedMessage ? marked.parse(detailedMessage) : '';
        
        const wrapper = document.createElement('div');
        wrapper.classList.add('markdown-content');
        wrapper.innerHTML = messageHtml;
        
        this.printMessage(wrapper.outerHTML, 'message-system', detailsHtml, true);
        
        // Process code blocks in the newly added content
        const addedContent = this.consoleElement.lastElementChild;
        addedContent.querySelectorAll('pre code').forEach(code => {
            const pre = code.parentElement;
            pre.style.position = 'relative';
            
            const button = document.createElement('button');
            button.className = 'copy-code-button';
            button.textContent = 'Copy';
            button.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            };
            
            pre.appendChild(button);
        });
    }

    // Alternative method to print markdown content
    printMarkdown(markdown, className = '', detailedMessage = '') {
        this.printSystemMessage(markdown, detailedMessage);
    }
}

customElements.define('web-console', ConsoleElement);

