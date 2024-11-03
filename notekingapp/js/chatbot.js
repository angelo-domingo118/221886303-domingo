const GROQ_API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const TOOL_MODEL = 'llama3-groq-70b-8192-tool-use-preview';
const CHAT_MODEL = 'mixtral-8x7b-32768';
const CHAT_MODEL_VERSATILE = 'llama-3.1-70b-versatile';

let messageHistory = [];

// Add this function to convert markdown to HTML
function markdownToHtml(text) {
    // Convert bullet points and numbered lists
    text = text.replace(/^(\d+)\.\s+/gm, '<span class="list-number">$1.</span> '); // Numbered lists
    text = text.replace(/^[-*]\s+/gm, '• '); // Bullet points
    
    // Convert line breaks to proper HTML
    text = text.replace(/\n/g, '<br>');
    
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Inline code
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return text;
}

// Update the addMessageToChat function
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    // Only add save button to bot messages
    if (role === 'bot') {
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = markdownToHtml(content); // Use innerHTML instead of textContent
        
        const saveButton = document.createElement('button');
        saveButton.className = 'save-note-btn';
        saveButton.innerHTML = '<span class="material-icons">save</span> Save as Note';
        saveButton.onclick = () => saveToNotes(content);
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(saveButton);
    } else {
        messageDiv.textContent = content;
    }
    
    chatMessages.appendChild(messageDiv);
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

async function analyzeIntent(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CHAT_MODEL_VERSATILE,
                messages: [
                    {
                        role: "system",
                        content: "You are an intent analyzer. Determine if the user's message requires note operations (create/read/update/delete) or is a general question. Respond with ONLY one of these: 'note_operation' or 'general_query'"
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.1,
                max_tokens: 10
            })
        });

        const data = await response.json();
        const intent = data.choices[0].message.content.trim().toLowerCase();
        return intent === 'note_operation';
    } catch (error) {
        console.error('Error analyzing intent:', error);
        return false;
    }
}

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
        // First analyze the intent
        const isNoteOperation = await analyzeIntent(message);
        
        messageHistory.push({
            role: "user",
            content: message
        });

        const modelToUse = isNoteOperation ? TOOL_MODEL : CHAT_MODEL_VERSATILE;
        const systemPrompt = isNoteOperation ? 
            `You are a helpful assistant that manages notes. You MUST use the provided functions for note operations:
            - To create a note: use createNote function
            - To search notes: use searchNotes function
            - To delete notes: use deleteNote function
            - To edit notes: use editNote function
            
            IMPORTANT: 
            - Always use the appropriate function for note operations
            - Do not just describe what you could do, actually use the function
            - Respond only with function calls for note operations` :
            "You are a helpful assistant that provides detailed, informative answers. If the user asks about creating or managing notes, suggest using specific commands like 'create note about [topic]' instead of providing information.";

        const requestBody = {
            model: modelToUse,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...messageHistory
            ],
            temperature: isNoteOperation ? 0.7 : 0.9,
            max_tokens: isNoteOperation ? 4096 : 2048,
            top_p: 1,
            stream: false
        };

        // Add tools only if it's a note operation
        if (isNoteOperation) {
            requestBody.tools = [
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
            ];
            requestBody.tool_choice = "auto";
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Remove loading indicator
        document.querySelector('.loading')?.remove();

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Unable to connect to AI service. Please check your API key configuration.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            } else {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0].message) {
            const message = data.choices[0].message;
            console.log('Model response:', message); // Debug log
            
            if (isNoteOperation && message.tool_calls) {
                console.log('Tool calls:', message.tool_calls); // Debug log
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
            } else if (isNoteOperation) {
                // If we expected tool use but didn't get it, try to extract intent
                if (message.content.toLowerCase().includes('create note') || 
                    message.content.toLowerCase().includes('make a note')) {
                    // Try to create note from the content
                    const content = message.content;
                    await saveToNotes(content);
                } else {
                    addMessageToChat('bot', 'I understand you want to work with notes. Please try rephrasing your request.');
                }
            } else {
                addMessageToChat('bot', message.content);
                messageHistory.push({
                    role: "assistant",
                    content: message.content
                });
            }
        }
    } catch (error) {
        console.error('Error details:', error); // Debug log
        document.querySelector('.loading')?.remove();
        
        let errorMessage = 'An error occurred while processing your request.';
        if (error.message.includes('API key')) {
            errorMessage = 'API key error: Please contact the administrator to check the API configuration.';
        } else if (error.message.includes('connect')) {
            errorMessage = 'Connection error: Unable to reach the AI service. Please try again later.';
        } else if (error.message.includes('tool_calls')) {
            errorMessage = 'Error with note operation. Please try again with a clearer request.';
        }
        
        addMessageToChat('bot', errorMessage);
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

// Add this function to generate title using Groq
async function generateTitle(content) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CHAT_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a title generator. Generate a concise, descriptive title (max 5-7 words) for the given content. The title should be catchy but informative. Do not use quotes or punctuation in the title. Respond with only the title."
                    },
                    {
                        role: "user",
                        content: `Generate a title for this content: ${content}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 50
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Unable to connect to AI service. Please check your API key configuration.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            } else {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating title:', error);
        // More robust fallback title generation
        const words = content.split(' ');
        const title = words.slice(0, 5).join(' ');
        return title.length > 50 ? title.substring(0, 47) + '...' : title;
    }
}

// Update the saveToNotes function to use the title generator
async function saveToNotes(content) {
    try {
        // Show saving indicator in chat
        addMessageToChat('bot', 'Generating title and saving note...');
        
        // Generate title using Groq
        const title = await generateTitle(content);
        
        const result = await callNoteAPI('create', {
            title: title,
            content: content
        });

        if (result.success) {
            // Show success message in chat
            addMessageToChat('bot', `Note saved successfully with title: "${title}"`);
            // Refresh the notes list
            await refreshNotesList();
        } else {
            addMessageToChat('bot', 'Failed to save note: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving note:', error);
        addMessageToChat('bot', 'Error saving note: ' + error.message);
    }
}