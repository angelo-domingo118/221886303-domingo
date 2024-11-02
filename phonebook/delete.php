<?php
include 'db.php';

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "DELETE FROM contacts WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        echo "Contact deleted successfully";
    } else {
        echo "Error deleting contact: " . $sql . "<br>" . $conn->error;
    }
}

header('location: index.php');


?>
