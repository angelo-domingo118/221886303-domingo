<?php
$originalString = readline("Input: ");
$reversedString = "";
$originalStringLength = strlen($originalString);

for ($index = $originalStringLength - 1; $index >= 0; $index--) {
    $reversedString .= $originalString[$index];
}

echo "Output: $reversedString";
?>