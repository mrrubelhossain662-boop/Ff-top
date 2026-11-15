<?php
// Frontend User Panel: Displays Dynamic Buttons and Fetched Products with Custom Pricing
// include 'db.php';

// Fetch all active API sources to create dynamic buttons
/*
$sources = $pdo->query("SELECT * FROM api_sources WHERE status = 1")->fetchAll(PDO::FETCH_ASSOC);
*/
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Ff-top - Panel</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-extrabold text-center mb-8 text-gray-900">গেম টপ-আপ প্যানেল</h1>
        
        <!-- Dynamic Buttons / Tabs Section -->
        <div class="flex flex-wrap justify-center gap-4 mb-10">
            <!-- Example dynamic button loop -->
            <button class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-indigo-700 transition">
                Supplier A Top-up
            </button>
        </div>

        <!-- Products Display Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Product Card Example -->
            <div class="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col justify-between">
                <div>
                    <img src="https://via.placeholder.com/300x150" alt="Product Image" class="rounded-lg mb-4 object-cover w-full h-36">
                    <h3 class="font-bold text-lg text-gray-800 mb-2">100 Diamond Free Fire</h3>
                    <p class="text-green-600 font-bold text-xl mb-4">৳ ১২০</p> <!-- Custom Overridden Price -->
                </div>
                <button class="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">খرید করুন (Buy Now)</button>
            </div>
        </div>
    </div>
</body>
</html>
