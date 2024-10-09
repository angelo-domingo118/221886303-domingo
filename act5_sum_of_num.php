<?php
$maxNumber = 100;
$totalSum = 0;
$currentNumber = 1;

while ($currentNumber <= $maxNumber) {
    $totalSum += $currentNumber;
    $currentNumber++;
}

echo "The sum of numbers from 1 to 100 is: $totalSum";
?>
