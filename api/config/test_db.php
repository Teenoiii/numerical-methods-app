<?php
require_once __DIR__ . '/../config/database.php';

$db = new Database();
$conn = $db->connect();

if ($conn) {
    echo "Connected to database successfully!";
} else {
    echo "Failed to connect to database!";
}
