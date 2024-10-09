<?php
for ($number = 1; $number <= 50; $number++) { 
    switch (true) {
        case $number % 15 == 0:
            echo "FizzBuzz ";
            break;
        case $number % 3 == 0:
            echo "Fizz ";
            break;
        case $number % 5 == 0:
            echo "Buzz ";
            break;
        default:
            echo "$number ";
            break;
    }
}
?>
