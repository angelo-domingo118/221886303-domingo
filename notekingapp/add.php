<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = trim($_POST['title']);
    $content = trim($_POST['content']);

    if (!empty($title) && !empty($content)) {
        $title = $conn->real_escape_string($title);
        $content = $conn->real_escape_string($content);

        $sql = "INSERT INTO notes (title, content) VALUES ('$title', '$content')";
        
        if ($conn->query($sql) === TRUE) {
            header("Location: index.php");
            exit();
        } else {
            $error = "Error: " . $conn->error;
        }
    } else {
        $error = "Both title and content are required!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add New Note - NoteKing App</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body>
    <div class="container form-page">
        <header>
            <h1>Add New Note</h1>
            <a href="index.php" class="back-btn">
                <span class="material-icons">arrow_back</span>
                Back to Notes
            </a>
        </header>

        <?php if (isset($error)): ?>
            <div class="error"><?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST" class="note-form">
            <div class="form-group">
                <label for="title">
                    <span class="material-icons">title</span>
                    Title
                </label>
                <input type="text" 
                       id="title" 
                       name="title" 
                       required
                       placeholder="Enter note title..."
                       autocomplete="off">
            </div>
            <div class="form-group">
                <label for="content">
                    <span class="material-icons">edit_note</span>
                    Content
                </label>
                <textarea id="content" 
                          name="content" 
                          rows="12" 
                          required
                          placeholder="Write your note content here..."></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="submit-btn">
                    <span class="material-icons">save</span>
                    Save Note
                </button>
            </div>
        </form>
    </div>
</body>
</html> 