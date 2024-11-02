<?php
include "../db.php";
header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (!$input || !isset($input['action'])) {
    echo json_encode(['error' => 'Invalid request']);
    exit();
}

$action = $input['action'];

switch($action) {
    case 'list':
        // Get all notes ordered by latest first
        $sql = "SELECT * FROM notes ORDER BY updated_at DESC";
        $result = $conn->query($sql);
        
        $notes = [];
        while($row = $result->fetch_assoc()) {
            $notes[] = $row;
        }
        echo json_encode(["success" => true, "notes" => $notes]);
        break;

    case 'create':
        if (!isset($input['title']) || !isset($input['content'])) {
            echo json_encode(['error' => 'Missing title or content']);
            exit();
        }
        
        $title = $conn->real_escape_string($input['title']);
        $content = $conn->real_escape_string($input['content']);
        
        $sql = "INSERT INTO notes (title, content) VALUES ('$title', '$content')";
        if ($conn->query($sql)) {
            echo json_encode([
                "success" => true, 
                "id" => $conn->insert_id,
                "message" => "Note created successfully"
            ]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
        break;
        
    case 'search':
        $query = $conn->real_escape_string($input['query']);
        $sql = "SELECT * FROM notes WHERE title LIKE '%$query%' OR content LIKE '%$query%'";
        $result = $conn->query($sql);
        
        $notes = [];
        while($row = $result->fetch_assoc()) {
            $notes[] = $row;
        }
        echo json_encode(["success" => true, "notes" => $notes]);
        break;
        
    case 'delete':
        if (!isset($input['query'])) {
            echo json_encode(['error' => 'Missing search query']);
            exit();
        }
        
        try {
            // First search for matching notes
            $query = $conn->real_escape_string($input['query']);
            $searchSql = "SELECT * FROM notes WHERE 
                          title LIKE ? OR 
                          content LIKE ?";
                          
            $stmt = $conn->prepare($searchSql);
            $searchParam = "%{$query}%";
            $stmt->bind_param("ss", $searchParam, $searchParam);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                echo json_encode([
                    "success" => false,
                    "message" => "No notes found matching your criteria",
                    "notes" => []
                ]);
                exit();
            }

            // Store matching notes before deletion
            $notes = [];
            while($row = $result->fetch_assoc()) {
                $notes[] = $row;
            }

            // If confirmed, proceed with deletion
            if (isset($input['confirm']) && $input['confirm'] === true) {
                $deleteSql = "DELETE FROM notes WHERE 
                              title LIKE ? OR 
                              content LIKE ?";
                              
                $stmt = $conn->prepare($deleteSql);
                $stmt->bind_param("ss", $searchParam, $searchParam);
                
                if ($stmt->execute()) {
                    $deletedCount = $stmt->affected_rows;
                    echo json_encode([
                        "success" => true,
                        "message" => "Notes deleted successfully",
                        "count" => $deletedCount
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "error" => $stmt->error
                    ]);
                }
            } else {
                // Return matching notes for confirmation
                echo json_encode([
                    "success" => true,
                    "requireConfirmation" => true,
                    "message" => "Found " . count($notes) . " matching notes. Please confirm deletion.",
                    "notes" => $notes
                ]);
            }
            
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "error" => $e->getMessage()
            ]);
        }
        break;
        
    case 'edit':
        if (!isset($input['id']) || !isset($input['title']) || !isset($input['content'])) {
            echo json_encode(['error' => 'Missing id, title or content']);
            exit();
        }
        
        $id = (int)$input['id'];
        $title = $conn->real_escape_string($input['title']);
        $content = $conn->real_escape_string($input['content']);
        
        $sql = "UPDATE notes SET title='$title', content='$content', updated_at=CURRENT_TIMESTAMP WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode([
                "success" => true, 
                "message" => "Note updated successfully"
            ]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?> 