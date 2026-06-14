#!/usr/bin/env php
<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

use RbAcc\Config;
use RbAcc\Database;

Config::load(dirname(__DIR__));

if (getenv('SKIP_DB_MIGRATE') === '1') {
    echo "[db] SKIP_DB_MIGRATE=1\n";
    exit(0);
}

$pdo = Database::pdo();
$pdo->exec(
    'CREATE TABLE IF NOT EXISTS _schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

$applied = [];
foreach ($pdo->query('SELECT id FROM _schema_migrations') as $row) {
    $applied[$row['id']] = true;
}

$dir = dirname(__DIR__) . '/sql/migrations';
$files = glob($dir . '/*.sql') ?: [];
sort($files);

$benign = [1050, 1054, 1060, 1061, 1091];

foreach ($files as $file) {
    $id = basename($file, '.sql');
    if (isset($applied[$id])) {
        continue;
    }

    $sql = file_get_contents($file);
    $statements = array_filter(array_map('trim', explode(';', preg_replace('/^--.*$/m', '', $sql))));
    foreach ($statements as $statement) {
        if ($statement === '') {
            continue;
        }
        try {
            $pdo->exec($statement);
        } catch (PDOException $e) {
            if (!in_array((int) $e->errorInfo[1], $benign, true)) {
                throw $e;
            }
            fwrite(STDERR, "[db] Skipped benign error in {$id}\n");
        }
    }

    $stmt = $pdo->prepare('INSERT INTO _schema_migrations (id) VALUES (?)');
    $stmt->execute([$id]);
    echo "[db] Applied migration {$id}\n";
}

echo "[db] Migrations complete\n";
