<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=profilingdp', 'root', '');
    echo "Direct PDO connection: SUCCESS\n";
    
    // Test a simple query
    $stmt = $pdo->query("SELECT COUNT(*) FROM yearly_salary_records LIMIT 1");
    $count = $stmt->fetchColumn();
    echo "Yearly salary records count: " . $count . "\n";
    
    // Check separation data
    $stmt = $pdo->query("SELECT separation_date_snapshot, separation_cause_snapshot FROM yearly_salary_records LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Sample separation data: " . json_encode($row) . "\n";
    
} catch (Exception $e) {
    echo "Database connection error: " . $e->getMessage() . "\n";
}
?>
