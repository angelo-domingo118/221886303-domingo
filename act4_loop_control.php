<?php
for ($counter = 1; $counter < 11; $counter++) {
    if ($counter == 5) {
        continue;
    }
    echo $counter . " ";
    if ($counter == 8) {
        break;
    }
}
?>
