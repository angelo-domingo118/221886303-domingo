<?php
$input = readline("Input: ");
if (!is_numeric($input) || strpos($input, '.') !== false || $input < 0 || $input != round($input)) {
    echo "Invalid input. Please enter a non-negative integer.";
} else {
    $number = intval($input);
    $factorial = 1;
    for ($i = 2; $i <= $number; $i++) {
        $factorial *= $i;
    }
    echo "Factorial of $number is: $factorial";
}
?>