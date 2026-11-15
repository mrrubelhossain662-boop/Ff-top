<?php
// Admin Panel: Add API Source and Manage Override Products
// Include your database connection and session check here
// session_start();
// include 'db.php';

// Handle Add API Form Submission
if(isset($_POST['add_api'])) {
    $button_name = $_POST['button_name'];
    $api_url = $_POST['api_url'];
    $api_token = $_POST['api_token'];
    
    // Insert into database (Example query using PDO/MySQLi)
    /*
    $stmt = $pdo->prepare("INSERT INTO api_sources (button_name, api_url, api_token) VALUES (?, ?, ?)");
    $stmt->execute([$button_name, $api_url, $api_token]);
    $success = "API Source added successfully!";
    */
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Admin - Add API Source</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">নতুন এপিআই সোর্স যোগ করুন (Add API Source)</h2>
        
        <form action="" method="POST" class="space-y-4">
            <div>
                <label class="block text-gray-700 font-semibold mb-2">সেকশন বা বাটনের নাম (Button Name):</label>
                <input type="text" name="button_name" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="যেমন: Supplier A Top-up">
            </div>
            <div>
                <label class="block text-gray-700 font-semibold mb-2">এপিআই ইউআরএল (API Endpoint URL):</label>
                <input type="url" name="api_url" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://provider-site.com/api/v1/products">
            </div>
            <div>
                <label class="block text-gray-700 font-semibold mb-2">এপিআই টোকেন/সিক্রেট কী (API Token):</label>
                <input type="text" name="api_token" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bearer Token or Secret Key">
            </div>
            <button type="submit" name="add_api" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">API সোর্স সেভ করুন</button>
        </form>
    </div>
</body>
</html>
