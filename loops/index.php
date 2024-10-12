<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Script Outputs</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
        
        body {
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #121212;
        }
        h1 {
            text-align: center;
            color: #bb86fc;
            font-size: 2.5em;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        .output-container {
            background-color: #1e1e1e;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        }
        h2 {
            color: #03dac6;
            border-bottom: 2px solid #03dac6;
            padding-bottom: 10px;
            font-size: 1.2em;
            margin-top: 0;
        }
        pre {
            background-color: #2c2c2c;
            border: 1px solid #333;
            border-radius: 5px;
            padding: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 0.8em;
            max-height: 150px;
            overflow-y: auto;
            flex-grow: 1;
            color: #e0e0e0;
        }
        .input-form {
            margin-top: 10px;
        }
        .input-form input[type="text"],
        .input-form input[type="number"],
        .input-form input[type="password"] {
            width: calc(100% - 16px);
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #444;
            border-radius: 4px;
            background-color: #2c2c2c;
            color: #e0e0e0;
        }
        .input-form input[type="submit"] {
            background-color: #bb86fc;
            color: #121212;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .input-form input[type="submit"]:hover {
            background-color: #9966cc;
        }
        .output-space {
            background-color: #2c2c2c;
            border: 1px solid #333;
            border-radius: 5px;
            padding: 10px;
            margin-top: 10px;
            font-family: monospace;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 0.8em;
            max-height: 100px;
            overflow-y: auto;
            color: #e0e0e0;
        }
    </style>
</head>
<body>
    <h1>PHP Script Outputs</h1>

    <div class="grid-container">
    <?php
    function displayOutput($title, $output, $inputForm = '') {
        echo "<div class='output-container'>";
        echo "<h2>$title</h2>";
        if ($output !== "") {
            echo "<pre>$output</pre>";
        }
        if ($inputForm !== '') {
            echo $inputForm;
        }
        echo "</div>";
    }

    // Act 1: Number Counter
    ob_start();
    $number = 1;
    while ($number <= 20) {
        if($number % 2 == 0){
            print($number." ");
        }
        $number++;
    }
    $output = ob_get_clean();
    displayOutput("Act 1: Even Numbers from 1 to 20", $output);

    // Act 2: Password Validator
    $passwordResult = "";
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password_submit'])) {
        $password = $_POST['password'];
        $correctPassword = "password123";
        $validated = false;
        do {
            if ($password === $correctPassword) {
                $passwordResult = "Access Granted.";
            } else {
                $passwordResult = "Incorrect Password.";
            }
            $validated = true;
        } while (!$validated);
    }

    $passwordForm = '
    <form method="post" class="input-form">
        <input type="password" name="password" placeholder="Enter password" required>
        <input type="submit" name="password_submit" value="Check Password">
    </form>';
    displayOutput("Act 2: Password Validator", $passwordResult, $passwordForm);

    // Act 3: Multiplication Table
    ob_start();
    for ($i = 1; $i <= 10; $i++) {
        $result = 7 * $i;
        echo "7 x $i = $result\n";
    }
    $output = ob_get_clean();
    displayOutput("Act 3: Multiplication Table of 7", $output);

    // Act 4: Loop Control
    ob_start();
    for ($counter = 1; $counter < 11; $counter++) {
        if ($counter == 5) {
            continue;
        }
        echo $counter . " ";
        if ($counter == 8) {
            break;
        }
    }
    $output = ob_get_clean();
    displayOutput("Act 4: Loop Control Example", $output);

    // Act 5: Sum of Numbers
    ob_start();
    $maxNumber = 100;
    $totalSum = 0;
    $currentNumber = 1;
    while ($currentNumber <= $maxNumber) {
        $totalSum += $currentNumber;
        $currentNumber++;
    }
    echo "The sum of numbers from 1 to 100 is: $totalSum";
    $output = ob_get_clean();
    displayOutput("Act 5: Sum of Numbers from 1 to 100", $output);

    // Act 6: Array Iteration
    ob_start();
    $movieList = array("Domestic Girlfriend", "Gintama", "Uzumaki", "Lain", "Your Name");
    foreach ($movieList as $movie) {
        $position = array_search($movie, $movieList) + 1;
        echo "$position. $movie\n";
    }
    $output = ob_get_clean();
    displayOutput("Act 6: Movie List", $output);

    // Act 7: Key-Value Pairs
    ob_start();
    $studentDetails = array("Name" => "Alice", "Age" => 20, "Grade" => "A", "City" => "Baguio");
    foreach ($studentDetails as $attribute => $detail) {
        echo "$attribute: $detail\n";
    }
    $output = ob_get_clean();
    displayOutput("Act 7: Student Details (Key-Value Pairs)", $output);

    // Act 8: Factorial Calculator
    $factorialResult = "";
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['factorial_submit'])) {
        $number = intval($_POST['factorialNumber']);
        if ($number < 0) {
            $factorialResult = "Invalid input. Please enter a non-negative integer.";
        } else {
            $factorial = 1;
            for ($i = 2; $i <= $number; $i++) {
                $factorial *= $i;
            }
            $factorialResult = "Factorial of $number is: $factorial";
        }
    }

    $factorialForm = '
    <form method="post" class="input-form">
        <input type="number" name="factorialNumber" placeholder="Enter a number" required>
        <input type="submit" name="factorial_submit" value="Calculate Factorial">
    </form>';
    displayOutput("Act 8: Factorial Calculator", $factorialResult, $factorialForm);

    // Act 9: FizzBuzz
    ob_start();
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
    $output = ob_get_clean();
    displayOutput("Act 9: FizzBuzz (1 to 50)", $output);

    // Act 10: Prime Number Checker
    $primeResult = "";
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['prime_submit'])) {
        $number = intval($_POST['primeNumber']);
        if ($number < 2) {
            $primeResult = "$number is not a prime number.";
        } else {
            $isPrime = true;
            for ($i = 2; $i <= sqrt($number); $i++) {
                if ($number % $i === 0) {
                    $isPrime = false;
                    break;
                }
            }
            if ($isPrime) {
                $primeResult = "$number is a prime number.";
            } else {
                $primeResult = "$number is not a prime number.";
            }
        }
    }

    $primeForm = '
    <form method="post" class="input-form">
        <input type="number" name="primeNumber" placeholder="Enter a number" required>
        <input type="submit" name="prime_submit" value="Check Prime">
    </form>';
    displayOutput("Act 10: Prime Number Checker", $primeResult, $primeForm);

    // Act 11: Fibonacci Sequence
    ob_start();
    $counter = 2; 
    $previousNumber = 0;
    $currentNumber = 1;
    echo $previousNumber." ".$currentNumber." ";
    while ($counter < 10) {
        $nextNumber = $previousNumber + $currentNumber;
        echo $nextNumber." ";
        $previousNumber = $currentNumber;
        $currentNumber = $nextNumber;
        $counter++;
    }
    $output = ob_get_clean();
    displayOutput("Act 11: Fibonacci Sequence (First 10 Numbers)", $output);

    // Act 12: String Reverse
    $reverseResult = "";
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['reverse_submit'])) {
        $originalString = $_POST['reverseString'];
        $reversedString = '';
        $length = strlen($originalString);
        for ($i = $length - 1; $i >= 0; $i--) {
            $reversedString .= $originalString[$i];
        }
        $reverseResult = "Original: $originalString\nReversed: $reversedString";
    }

    $reverseForm = '
    <form method="post" class="input-form">
        <input type="text" name="reverseString" placeholder="Enter a string" required>
        <input type="submit" name="reverse_submit" value="Reverse String">
    </form>';
    displayOutput("Act 12: String Reverse", $reverseResult, $reverseForm);
    ?>

    </div>
</body>
</html>