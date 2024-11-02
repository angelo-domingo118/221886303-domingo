<?php
include "db.php";

// Fetch all notes
$sql = "SELECT * FROM notes ORDER BY updated_at DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NoteKing App</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="notes-section">
            <header>
                <h1>NoteKing App</h1>
                <a href="add.php" class="add-btn">Add New Note</a>
            </header>

            <div class="notes-grid">
                <?php if ($result->num_rows > 0): ?>
                    <?php while($row = $result->fetch_assoc()): ?>
                        <div class="note-card">
                            <h2><?php echo htmlspecialchars($row['title']); ?></h2>
                            <p><?php echo nl2br(htmlspecialchars($row['content'])); ?></p>
                            <div class="note-footer">
                                <span class="date">Last updated: <?php echo date('M d, Y', strtotime($row['updated_at'])); ?></span>
                                <div class="actions">
                                    <a href="edit.php?id=<?php echo $row['id']; ?>" class="edit-btn">Edit</a>
                                    <a href="delete.php?id=<?php echo $row['id']; ?>" class="delete-btn" onclick="return confirm('Are you sure you want to delete this note?')">Delete</a>
                                </div>
                            </div>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p class="no-notes">No notes found. Create your first note!</p>
                <?php endif; ?>
            </div>
        </div>

        <div class="chatbot-section">
            <div class="chat-container">
                <div class="chat-header">
                    <div class="chat-title">
                        <span class="material-icons">smart_toy</span>
                        <h3>AI Assistant</h3>
                    </div>
                </div>
                <div class="voice-controls">
                    <button id="voice-button" onclick="toggleRecording()">
                        <span class="material-icons">mic</span>
                    </button>
                    <div class="status-indicator" id="status">Click to start speaking</div>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="input-area">
                    <input type="text" 
                           id="user-input" 
                           placeholder="Ask me anything about your notes..."
                           autocomplete="off">
                    <button onclick="sendMessage()" class="btn-send">
                        <span class="material-icons">send</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="js/chatbot.js"></script>
</body>
</html> 