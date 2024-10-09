<?php
$correctPassword = "password123";
do {
    $userInput = readline("Please enter the password: ");
    if ($correctPassword !== $userInput) {
        echo "Incorrect Password.\n";
    }
} while ($correctPassword !== $userInput);
echo "Access Granted.";
?>