<?php
$input = readline("Enter a number: ");

if (!is_numeric($input) || strpos($input, '.') !== false || $input < 0 || $input != round($input)) {
    echo "Invalid input. Please enter a non-negative integer.";
} else {
    $number = intval($input);
    $isPrime = true;

    if ($number <= 1) {
        $isPrime = false;
    } else {
        for ($divisor = 2; $divisor < $number; $divisor++) {
            if ($number % $divisor == 0) {
                $isPrime = false;
                break;
            }
        }
    }

    if ($isPrime) {
        echo "$number is a prime number.";
    } else {
        echo "$number is not a prime number.";
    }
}