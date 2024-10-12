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
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f4f8;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        .output-container {
            background-color: #fff;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }
        h2 {
            color: #3498db;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            font-size: 1.2em;
            margin-top: 0;
        }
        pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 0.8em;
            max-height: 150px;
            overflow-y: auto;
            flex-grow: 1;
        }
        .input-form {
            margin-top: 10px;
        }
        .input-form input[type="text"],
        .input-form input[type="number"] {
            width: calc(100% - 16px);
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .input-form input[type="submit"] {
            background-color: #2ecc71;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .input-form input[type="submit"]:hover {
            background-color: #27ae60;
        }
        .output-space {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 10px;
            margin-top: 10px;
            font-family: monospace;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 0.8em;
            max-height: 100px;
            overflow-y: auto;
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
    $passwordForm = '
    <form class="input-form" onsubmit="return validatePassword(event)">
        <input type="text" id="password" placeholder="Enter password">
        <input type="submit" value="Check Password">
    </form>
    <div id="passwordOutput" class="output-space"></div>';
    displayOutput("Act 2: Password Validator", "", $passwordForm);

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
    $factorialForm = '
    <form class="input-form" onsubmit="return calculateFactorial(event)">
        <input type="number" id="factorialNumber" placeholder="Enter a number">
        <input type="submit" value="Calculate Factorial">
    </form>
    <div id="factorialOutput" class="output-space"></div>';
    displayOutput("Act 8: Factorial Calculator", "", $factorialForm);

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
    $primeForm = '
    <form class="input-form" onsubmit="return checkPrime(event)">
        <input type="number" id="primeNumber" placeholder="Enter a number">
        <input type="submit" value="Check Prime">
    </form>
    <div id="primeOutput" class="output-space"></div>';
    displayOutput("Act 10: Prime Number Checker", "", $primeForm);

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
    $reverseForm = '
    <form class="input-form" onsubmit="return reverseString(event)">
        <input type="text" id="reverseString" placeholder="Enter a string">
        <input type="submit" value="Reverse String">
    </form>
    <div id="reverseOutput" class="output-space"></div>';
    displayOutput("Act 12: String Reverse", "", $reverseForm);
    ?>

    <script>
    function validatePassword(event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        const correctPassword = "password123";
        const output = password === correctPassword ? "Access Granted." : "Incorrect Password.";
        document.getElementById('passwordOutput').textContent = output;
    }

    function calculateFactorial(event) {
        event.preventDefault();
        const number = parseInt(document.getElementById('factorialNumber').value);
        if (isNaN(number) || number < 0) {
            document.getElementById('factorialOutput').textContent = "Invalid input. Please enter a non-negative integer.";
        } else {
            let factorial = 1;
            for (let i = 2; i <= number; i++) {
                factorial *= i;
            }
            document.getElementById('factorialOutput').textContent = `Factorial of ${number} is: ${factorial}`;
        }
    }

    function checkPrime(event) {
        event.preventDefault();
        const number = parseInt(document.getElementById('primeNumber').value);
        if (isNaN(number) || number < 0) {
            document.getElementById('primeOutput').textContent = "Invalid input. Please enter a non-negative integer.";
        } else {
            let isPrime = number > 1;
            for (let i = 2; i < number; i++) {
                if (number % i === 0) {
                    isPrime = false;
                    break;
                }
            }
            document.getElementById('primeOutput').textContent = isPrime ? `${number} is a prime number.` : `${number} is not a prime number.`;
        }
    }

    function reverseString(event) {
        event.preventDefault();
        const originalString = document.getElementById('reverseString').value;
        const reversedString = originalString.split('').reverse().join('');
        document.getElementById('reverseOutput').textContent = `Original: ${originalString}\nReversed: ${reversedString}`;
    }

    // Add event listeners to forms
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('form[onsubmit="return validatePassword(event)"]').addEventListener('submit', validatePassword);
        document.querySelector('form[onsubmit="return calculateFactorial(event)"]').addEventListener('submit', calculateFactorial);
        document.querySelector('form[onsubmit="return checkPrime(event)"]').addEventListener('submit', checkPrime);
        document.querySelector('form[onsubmit="return reverseString(event)"]').addEventListener('submit', reverseString);
    });
    </script>
</body>
</html>
