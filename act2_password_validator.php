<?php
$pass = "password123";
do {
    $passInput = readline("Please enter the password: ");
    if ($pass !== $passInput) {
        echo "Incorrect Password.\n";
    }
} while ($pass !== $passInput);
echo "Access Granted.";
?>