<?php

declare(strict_types=1);

namespace RbAcc;

use PDO;

final class MemberRepository
{
    public static function findByEmail(string $email): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM rb_members WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByPhone(string $phone): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM rb_members WHERE phone = ? LIMIT 1');
        $stmt->execute([$phone]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM rb_members WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function toPublic(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'email' => $row['email'],
            'full_name' => $row['full_name'],
            'phone' => $row['phone'],
            'blood_group' => $row['blood_group'],
            'bike_model' => $row['bike_model'],
            'bike_color' => $row['bike_color'],
            'bike_registration' => $row['bike_registration'],
            'emergency_contact_name' => $row['emergency_contact_name'],
            'emergency_contact_phone' => $row['emergency_contact_phone'],
            'membership_status' => $row['membership_status'],
            'created_at' => $row['created_at'],
        ];
    }

    public static function create(array $input): array
    {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare(
            'INSERT INTO rb_members (
                email, password_hash, full_name, phone, blood_group, bike_color, bike_registration,
                emergency_contact_name, emergency_contact_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $input['email'],
            $input['password_hash'],
            $input['full_name'],
            $input['phone'],
            $input['blood_group'],
            $input['bike_color'],
            $input['bike_registration'],
            $input['emergency_contact_name'],
            $input['emergency_contact_phone'],
        ]);

        $member = self::findById((int) $pdo->lastInsertId());
        if ($member === null) {
            throw new \RuntimeException('Failed to load member after registration');
        }
        return $member;
    }

    public static function activateIfPending(int $id): void
    {
        $stmt = Database::pdo()->prepare(
            "UPDATE rb_members SET membership_status = 'active' WHERE id = ? AND membership_status = 'pending'"
        );
        $stmt->execute([$id]);
    }

    public static function update(int $id, array $input): array
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE rb_members SET
                full_name = ?,
                phone = ?,
                blood_group = ?,
                bike_color = ?,
                bike_registration = ?,
                emergency_contact_name = ?,
                emergency_contact_phone = ?,
                password_hash = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $input['full_name'],
            $input['phone'],
            $input['blood_group'],
            $input['bike_color'],
            $input['bike_registration'],
            $input['emergency_contact_name'],
            $input['emergency_contact_phone'],
            $input['password_hash'],
            $id,
        ]);

        $member = self::findById($id);
        if ($member === null) {
            throw new \RuntimeException('Failed to load member after update');
        }
        return $member;
    }
}
