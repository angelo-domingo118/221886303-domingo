<?php
$movieList = array("Domestic Girlfriend", "Gintama", "Uzumaki", "Lain", "Your Name");
foreach ($movieList as $movie) {
    $position = array_search($movie, $movieList) + 1;
    echo "$position. $movie\n";
}
?>