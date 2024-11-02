const GROQ_API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let messageHistory = [];

function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    
    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callNoteAPI(action, data) {
    try {
        const response = await fetch('api/notes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ action, ...data })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Refresh notes list after successful operations
        if (['create', 'edit', 'delete'].includes(action) && result.success) {
            await refreshNotesList();
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

document.getElementById('user-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;

    addMessageToChat('user', message);
    input.value = '';

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading';
    loadingDiv.textContent = 'Bot is typing...';
    document.getElementById('chat-messages').appendChild(loadingDiv);

    try {
        messageHistory.push({
            role: "user",
            content: message
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3-groq-70b-8192-tool-use-preview",
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant that manages notes. You can:
                        1. Create notes:
                           - When asked to create a note, use ONLY the createNote function
                           - Do not provide additional information in chat
                           - Generate a clear title and comprehensive content
                           - Example: If user asks "create note about cats", use createNote with title "Cats" and detailed content
                           - Do not create multiple notes unless specifically requested
                           - Always check if note exists before creating
                        2. Edit notes:
                           - When asked to edit a note:
                             * First use searchNotes to find the note
                             * Show matching notes to user
                             * Wait for user to confirm which note to edit
                             * After user confirms, use editNote function with:
                               - The correct note ID
                               - The new content
                               - Keep original title unless specifically asked to change it
                           - Handle requests like:
                             * "edit the note about cats"
                             * "update the cat breeds note"
                             * "summarize the cat behavior note"
                           - Always confirm successful edits
                           - Do not just show edited content, actually update the note
                        3. Delete notes:
                           - Use deleteNote function for various delete requests
                           - Always search first and ask for confirmation
                           - Confirm after successful deletion
                        4. Search notes:
                           - Use searchNotes function to find existing notes
                           - Show search results to user

                        Important:
                        - Use ONLY ONE function call per user request unless explicitly needed
                        - Do not mix function calls with regular chat responses
                        - When creating notes, put ALL content in the note content field, not in chat`
                    },
                    ...messageHistory
                ],
                tools: [
                    {
                        type: "function",
                        function: {
                            name: "createNote",
                            description: "Create a new note",
                            parameters: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string",
                                        description: "Title of the note"
                                    },
                                    content: {
                                        type: "string",
                                        description: "Content of the note"
                                    }
                                },
                                required: ["title", "content"]
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "searchNotes",
                            description: "Search for notes",
                            parameters: {
                                type: "object",
                                properties: {
                                    query: {
                                        type: "string",
                                        description: "Search query"
                                    }
                                },
                                required: ["query"]
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "deleteNote",
                            description: "Delete notes by searching title or content",
                            parameters: {
                                type: "object",
                                properties: {
                                    query: {
                                        type: "string",
                                        description: "Search terms to find notes for deletion"
                                    },
                                    confirm: {
                                        type: "boolean",
                                        description: "Confirmation for deletion"
                                    }
                                },
                                required: ["query"]
                            }
                        }
                    },
                    {
                        type: "function",
                        function: {
                            name: "editNote",
                            description: "Edit an existing note",
                            parameters: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "integer",
                                        description: "ID of the note to edit"
                                    },
                                    title: {
                                        type: "string",
                                        description: "New title for the note"
                                    },
                                    content: {
                                        type: "string",
                                        description: "New content for the note"
                                    }
                                },
                                required: ["id", "title", "content"]
                            }
                        }
                    }
                ],
                tool_choice: "auto",
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        // Remove loading indicator
        document.querySelector('.loading')?.remove();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0].message) {
            const message = data.choices[0].message;
            
            if (message.tool_calls) {
                // Track if we've already created a note in this interaction
                let noteCreated = false;
                
                for (const toolCall of message.tool_calls) {
                    const functionName = toolCall.function.name;
                    let functionArgs;
                    
                    try {
                        functionArgs = JSON.parse(toolCall.function.arguments);
                    } catch (error) {
                        console.error('Error parsing function arguments:', error);
                        continue;
                    }

                    try {
                        if (functionName === 'createNote') {
                            // Prevent multiple note creations in same interaction
                            if (noteCreated) {
                                continue;
                            }

                            // Check for existing note first
                            const existingNotes = await callNoteAPI('search', { query: functionArgs.title });
                            if (existingNotes.notes && existingNotes.notes.some(note => 
                                note.title.toLowerCase() === functionArgs.title.toLowerCase())) {
                                addMessageToChat('bot', `A note with the title "${functionArgs.title}" already exists.`);
                                continue;
                            }

                            const result = await callNoteAPI('create', functionArgs);
                            if (result.success) {
                                addMessageToChat('bot', `Created note: "${functionArgs.title}"`);
                                await refreshNotesList();
                                noteCreated = true;
                            }
                        } else if (functionName === 'deleteNote') {
                            const result = await callNoteAPI('delete', functionArgs);
                            
                            if (result.requireConfirmation) {
                                if (!result.notes || result.notes.length === 0) {
                                    addMessageToChat('bot', 'I couldn\'t find any notes matching your request.');
                                    return;
                                }

                                const notesList = result.notes.map(note => 
                                    `- "${note.title}"`
                                ).join('\n');

                                const confirmMessage = `I found these notes:\n${notesList}\n\nWould you like me to delete them? Please confirm with yes or no.`;
                                addMessageToChat('bot', confirmMessage);

                                messageHistory.push({
                                    role: "function",
                                    name: "deleteNote",
                                    content: JSON.stringify({
                                        pendingDelete: true,
                                        query: functionArgs.query,
                                        notes: result.notes
                                    })
                                });
                                return;
                            }

                            if (functionArgs.confirm === true) {
                                const deleteResult = await callNoteAPI('delete', functionArgs);
                                if (deleteResult.success) {
                                    addMessageToChat('bot', `Successfully deleted ${deleteResult.count} note(s).`);
                                    await refreshNotesList();
                                    return;
                                }
                            }
                        } else if (functionName === 'editNote') {
                            try {
                                // Check for pending edit in message history
                                const pendingEdit = messageHistory.find(msg => 
                                    msg.role === "function" && 
                                    msg.name === "editNote" && 
                                    JSON.parse(msg.content).pendingEdit
                                );

                                if (pendingEdit) {
                                    const editDetails = JSON.parse(pendingEdit.content);
                                    
                                    // Find the selected note by title
                                    const selectedNote = editDetails.notes.find(note => 
                                        note.title.toLowerCase() === message.content.toLowerCase() ||
                                        note.title.toLowerCase() === functionArgs.title?.toLowerCase()
                                    );

                                    if (selectedNote) {
                                        // If we have proposed changes, use them
                                        const editParams = {
                                            id: selectedNote.id,
                                            title: editDetails.proposedChanges?.title || selectedNote.title,
                                            content: editDetails.proposedChanges?.content || functionArgs.content || selectedNote.content
                                        };

                                        const result = await callNoteAPI('edit', editParams);
                                        
                                        if (result.success) {
                                            addMessageToChat('bot', `Successfully updated note: "${editParams.title}"`);
                                            await refreshNotesList();
                                            
                                            // Clear the pending edit from history
                                            messageHistory = messageHistory.filter(msg => 
                                                !(msg.role === "function" && 
                                                  msg.name === "editNote" && 
                                                  JSON.parse(msg.content).pendingEdit)
                                            );
                                        } else {
                                            addMessageToChat('bot', `Failed to update note: ${result.error}`);
                                        }
                                    } else {
                                        addMessageToChat('bot', 'Could not find the specified note to edit.');
                                    }
                                } else {
                                    // First time edit request, search for the note
                                    const searchResult = await callNoteAPI('search', { 
                                        query: functionArgs.query || functionArgs.title 
                                    });
                                    
                                    if (!searchResult.notes || searchResult.notes.length === 0) {
                                        addMessageToChat('bot', 'I couldn\'t find any notes matching your request.');
                                        return;
                                    }

                                    // Show matching notes to user
                                    const notesList = searchResult.notes.map(note => 
                                        `- "${note.title}": ${note.content.substring(0, 50)}...`
                                    ).join('\n');

                                    const confirmMessage = `Here are the matching notes:\n${notesList}\n\nPlease confirm which note you want to edit by replying with the title.`;
                                    addMessageToChat('bot', confirmMessage);

                                    // Store the search results and proposed changes
                                    messageHistory.push({
                                        role: "function",
                                        name: "editNote",
                                        content: JSON.stringify({
                                            pendingEdit: true,
                                            notes: searchResult.notes,
                                            proposedChanges: {
                                                title: functionArgs.title,
                                                content: functionArgs.content
                                            }
                                        })
                                    });
                                }
                            } catch (error) {
                                console.error('Edit function error:', error);
                                addMessageToChat('bot', `Sorry, there was an error editing the note: ${error.message}`);
                            }
                        } else if (functionName === 'searchNotes') {
                            const result = await callNoteAPI('search', functionArgs);
                            
                            if (!result.notes || result.notes.length === 0) {
                                addMessageToChat('bot', 'No notes found matching your search.');
                                return;
                            }

                            const notesList = result.notes.map(note => 
                                `- "${note.title}": ${note.content.substring(0, 100)}...`
                            ).join('\n');

                            addMessageToChat('bot', `Here are the matching notes:\n${notesList}`);
                            
                            messageHistory.push({
                                role: "function",
                                name: "searchNotes",
                                content: JSON.stringify(result)
                            });
                        } else {
                            // Handle other function calls
                            const result = await callNoteAPI(
                                functionName.replace('Note', '').toLowerCase(),
                                functionArgs
                            );
                            messageHistory.push({
                                role: "function",
                                name: functionName,
                                content: JSON.stringify(result)
                            });
                        }
                    } catch (error) {
                        console.error('Function call error:', error);
                        addMessageToChat('bot', `Sorry, there was an error: ${error.message}`);
                        return;
                    }
                }

                // Only get final response if we haven't created a note
                if (!noteCreated) {
                    // Get final response with function results
                    const finalResponse = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: "llama3-groq-70b-8192-tool-use-preview",
                            messages: messageHistory,
                            temperature: 0.7,
                            max_tokens: 1000
                        })
                    });
                    
                    const finalData = await finalResponse.json();
                    if (finalData.choices && finalData.choices[0].message) {
                        const botResponse = finalData.choices[0].message.content;
                        // Only show response if it's not a tool call
                        if (!botResponse.includes('<tool_call>')) {
                            addMessageToChat('bot', botResponse);
                        }
                    }
                }
            } else {
                addMessageToChat('bot', message.content);
            }
            
            // Add bot's response to message history
            messageHistory.push({
                role: "assistant",
                content: message.content
            });
        }
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.loading')?.remove();
        addMessageToChat('bot', `Error: ${error.message}`);
    }
}

// Initialize voice recognition if available
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        const input = document.getElementById('user-input');
        input.value = event.results[0][0].transcript;
        document.getElementById('status').textContent = 'Click to start speaking';
        sendMessage();
    };

    recognition.onerror = function(event) {
        document.getElementById('status').textContent = 'Error occurred in recognition: ' + event.error;
    };
}

function toggleRecording() {
    if (!recognition) {
        document.getElementById('status').textContent = 'Speech recognition not supported';
        return;
    }

    if (recognition.started) {
        recognition.stop();
        document.getElementById('status').textContent = 'Click to start speaking';
        recognition.started = false;
    } else {
        recognition.start();
        document.getElementById('status').textContent = 'Listening...';
        recognition.started = true;
    }
}

// Add this function to fetch and display notes
async function refreshNotesList() {
    try {
        const response = await fetch('api/notes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ action: 'list' }) // New action to get all notes
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            const notesGrid = document.querySelector('.notes-grid');
            if (notesGrid) {
                notesGrid.innerHTML = data.notes.map(note => `
                    <div class="note-card">
                        <h2>${note.title}</h2>
                        <p>${note.content}</p>
                        <div class="note-footer">
                            <span class="date">Last updated: ${new Date(note.updated_at).toLocaleDateString()}</span>
                            <div class="actions">
                                <a href="edit.php?id=${note.id}" class="edit-btn">Edit</a>
                                <a href="delete.php?id=${note.id}" class="delete-btn" onclick="return confirm('Are you sure you want to delete this note?')">Delete</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error refreshing notes:', error);
    }
}

// Call refreshNotesList when the page loads
document.addEventListener('DOMContentLoaded', refreshNotesList);

function toggleChatbot() {
    const chatbotSection = document.querySelector('.chatbot-section');
    const toggleButton = document.querySelector('.chatbot-toggle');
    
    chatbotSection.classList.toggle('active');
    
    // Handle toggle button visibility
    if (chatbotSection.classList.contains('active')) {
        toggleButton.style.display = 'none';
    } else {
        toggleButton.style.display = 'flex';
    }
}

// Hide chatbot by default on all screens
document.addEventListener('DOMContentLoaded', () => {
    const chatbotSection = document.querySelector('.chatbot-section');
    chatbotSection.classList.remove('active');
});