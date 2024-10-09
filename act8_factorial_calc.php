<?php
$num = 5;
$product = $num;
for ($i=$num-1; $i > 1; $i--) { 
    $product *= $i;
}
echo "Factorial of $num is: $product";
?>