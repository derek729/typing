<?php
header('Content-Type: application/json');
require_once '../config/database.php';

switch($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if(isset($data['action'])) {
            switch($data['action']) {
                case 'signup':
                    // 회원가입 처리
                    $email = $data['email'];
                    $password = password_hash($data['password'], PASSWORD_DEFAULT);
                    
                    $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
                    $stmt->execute([$email, $password]);
                    
                    echo json_encode(['success' => true, 'message' => '회원가입이 완료되었습니다.']);
                    break;
                    
                case 'login':
                    // 로그인 처리
                    $email = $data['email'];
                    $password = $data['password'];
                    
                    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
                    $stmt->execute([$email]);
                    $user = $stmt->fetch();
                    
                    if($user && password_verify($password, $user['password'])) {
                        echo json_encode(['success' => true, 'message' => '로그인되었습니다.']);
                    } else {
                        echo json_encode(['success' => false, 'message' => '이메일 또는 비밀번호가 올바르지 않습니다.']);
                    }
                    break;
            }
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => '잘못된 요청입니다.']);
        break;
}
?> 