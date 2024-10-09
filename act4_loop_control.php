<?php
for ($i = 1; $i < 11; $i++) {
    if ($i == 5) {
        continue;
    }
    echo $i . " ";
    if ($i == 8) {
        break;
    }
}
?>
