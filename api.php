
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db_file = 'database.sqlite';
try {
    $db = new PDO("sqlite:$db_file");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Initialize Database
    $db->exec("CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, price REAL, image TEXT, description TEXT, category TEXT)");
    $db->exec("CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, customer_name TEXT, customer_phone TEXT, items TEXT, total_price REAL, status TEXT, created_at TEXT)");

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if ($route === 'products') {
            $stmt = $db->query("SELECT * FROM products");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($route === 'orders') {
            $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($orders as &$o) { $o['items'] = json_decode($o['items'], true); }
            echo json_encode($orders);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($route === 'add_product') {
            $stmt = $db->prepare("INSERT OR REPLACE INTO products (id, name, price, image, description, category) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$input['id'], $input['name'], $input['price'], $input['image'], $input['description'], $input['category']]);
            echo json_encode(['status' => 'success']);
        } elseif ($route === 'delete_product') {
            $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$input['id']]);
            echo json_encode(['status' => 'success']);
        } elseif ($route === 'place_order') {
            $stmt = $db->prepare("INSERT INTO orders (id, customer_name, customer_phone, items, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$input['id'], $input['customerName'], $input['customerPhone'], json_encode($input['items']), $input['totalPrice'], $input['status'], $input['createdAt']]);
            echo json_encode(['status' => 'success']);
        } elseif ($route === 'update_order_status') {
            $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $input['id']]);
            echo json_encode(['status' => 'success']);
        } elseif ($route === 'delete_order') {
            $stmt = $db->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$input['id']]);
            echo json_encode(['status' => 'success']);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
