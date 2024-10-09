<?php
$input = intval(readline("Enter a number: "));
$isPrime = true;

if ($input <= 1) {
    $isPrime = false;
} else {
    for ($i = 2; $i < $input; $i++) {
        if ($input % $i == 0) {
            $isPrime = false;
            break;
        }
    }
}

if ($isPrime) {
    echo "$input is a prime number.";
} else {
    echo "$input is not a prime number.";
}