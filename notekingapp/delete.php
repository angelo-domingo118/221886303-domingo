<?php
include "db.php";

if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $sql = "DELETE FROM notes WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        header("Location: index.php");
        exit();
    }
}

header("Location: index.php");
?> 