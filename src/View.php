<?php

declare(strict_types=1);

namespace RbAcc;

final class View
{
    public static function render(string $template, array $vars = []): void
    {
        extract($vars, EXTR_SKIP);
        require dirname(__DIR__) . '/views/' . $template . '.php';
    }

    public static function e(?string $value): string
    {
        return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
    }

    public static function statusBadge(string $status): string
    {
        $class = match ($status) {
            'active' => 'status-active',
            'suspended' => 'status-suspended',
            default => 'status-pending',
        };
        return '<span class="status-badge ' . $class . '">' . self::e($status) . '</span>';
    }
}
