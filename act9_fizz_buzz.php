<?php
for ($i=1; $i < 51; $i++) { 
    switch ($i) {
        case $i % 15 == 0:
            echo "FizzBuzz ";
            break;
        case $i % 3 == 0:
            echo "Fizz ";
            break;
        case $i % 5 == 0:
            echo "Buzz ";
            break;
        default:
            echo "$i ";
            break;
    }
}

