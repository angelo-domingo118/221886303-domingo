<?php
$movies = array("Domestic Girlfriend", "Gintama", "Uzumaki", "Lain", "Your Name");
foreach ($movies as $movie) {
    $index = array_search($movie, $movies) + 1;
    echo "$index. $movie\n";
}
?>