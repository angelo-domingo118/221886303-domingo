<?php
$counter = 2; 
$previousNumber = 0;
$currentNumber = 1;
echo $previousNumber." ".$currentNumber." ";
while ($counter < 10) { //
    $nextNumber = $previousNumber + $currentNumber;
    echo $nextNumber." ";
    $previousNumber = $currentNumber;
    $currentNumber = $nextNumber;
    $counter++;
}
?>
