let searchTimeout = null;
const searchInput = document.getElementById('search-input');
const notesGrid = document.querySelector('.notes-grid');

// Add loading state to notes grid
function setLoadingState(loading) {
    if (loading) {
        notesGrid.classList.add('loading');
    } else {
        notesGrid.classList.remove('loading');
    }
}

// Format date helper
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Create note card HTML
function createNoteCard(note) {
    return `
        <div class="note-card" data-id="${note.id}">
            <div class="note-card-content">
                <h2>${escapeHtml(note.title)}</h2>
                <p>${escapeHtml(note.content)}</p>
            </div>
            <div class="note-footer">
                <span class="date">Last updated: ${formatDate(note.updated_at)}</span>
                <div class="actions">
                    <a href="edit.php?id=${note.id}" class="edit-btn">Edit</a>
                    <a href="delete.php?id=${note.id}" 
                       class="delete-btn" 
                       onclick="return confirm('Are you sure you want to delete this note?')">Delete</a>
                </div>
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Handle search
async function handleSearch(query) {
    try {
        setLoadingState(true);
        
        const response = await fetch('api/notes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'search',
                query: query
            })
        });

        const data = await response.json();
        
        if (data.success) {
            notesGrid.innerHTML = data.notes.length > 0 
                ? data.notes.map(note => createNoteCard(note)).join('')
                : '<div class="no-results">No notes found matching your search</div>';
        } else {
            throw new Error(data.error || 'Search failed');
        }
    } catch (error) {
        console.error('Search error:', error);
        notesGrid.innerHTML = `<div class="error-message">Error performing search: ${error.message}</div>`;
    } finally {
        setLoadingState(false);
    }
}

// Initialize search functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout for search
        searchTimeout = setTimeout(() => {
            if (query.length === 0) {
                // If search is empty, refresh to show all notes
                window.location.reload();
                return;
            }
            
            if (query.length >= 2) {
                handleSearch(query);
            }
        }, 300);
    });

    // Add clear search functionality
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            window.location.reload();
        }
    });
} 