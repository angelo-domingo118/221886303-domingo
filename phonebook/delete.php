<?php
include 'db.php';

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "DELETE FROM contacts WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        header('Location: index.php');
        exit();
    } else {
        header('Location: index.php?error=1');
        exit();
    }
}

header('Location: index.php');
exit();
?>
