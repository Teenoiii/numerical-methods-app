<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/EquationModel.php';


$db = new Database();
$conn = $db->connect();
$equationModel = new EquationModel($conn);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'random') {
            echo json_encode($equationModel->getRandom());
        } else {
            echo json_encode($equationModel->getAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['expression'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing equation expression']);
            exit;
        }
        if ($equationModel->create($data['expression'])) {
            echo json_encode(['success' => true, 'message' => 'Equation added']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add equation']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id']) || !isset($data['expression'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing id or expression']);
            exit;
        }
        if ($equationModel->update($data['id'], $data['expression'])) {
            echo json_encode(['success' => true, 'message' => 'Equation updated']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update equation']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing id']);
            exit;
        }

        $id = $data['id'];

        if ($equationModel->delete($id)) {
            echo json_encode(['success' => true, 'message' => 'Equation deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete equation']);
        }
        break;


    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
        break;
}
