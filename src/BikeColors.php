<?php

declare(strict_types=1);

namespace RbAcc;

final class BikeColors
{
    /** @var list<array{id:string,name:string,swatch:string,image:string}> */
    public const COLORS = [
        ['id' => 'astral-black', 'name' => 'Astral Black', 'swatch' => '#1c1c1c', 'image' => '/img/models/1_astral_black.png'],
        ['id' => 'astral-blue', 'name' => 'Astral Blue', 'swatch' => '#1e3a5f', 'image' => '/img/models/2_astral_blue.png'],
        ['id' => 'astral-green', 'name' => 'Astral Green', 'swatch' => '#2d4a3e', 'image' => '/img/models/3_astral_green.png'],
        ['id' => 'interstellar-green', 'name' => 'Interstellar Green', 'swatch' => '#3d5c52', 'image' => '/img/models/4_interstellar_green.png'],
        ['id' => 'interstellar-grey', 'name' => 'Interstellar Grey', 'swatch' => '#6b7280', 'image' => '/img/models/5_interstellar_grey.png'],
        ['id' => 'celestial-red', 'name' => 'Celestial Red', 'swatch' => '#8b2635', 'image' => '/img/models/6_celestial_red.png'],
        ['id' => 'celestial-blue', 'name' => 'Celestial Blue', 'swatch' => '#4a6fa5', 'image' => '/img/models/7_celestial_blue.png'],
    ];

    public static function isValid(?string $name): bool
    {
        if ($name === null || trim($name) === '') {
            return true;
        }
        $normalized = strtolower(trim($name));
        foreach (self::COLORS as $color) {
            if (strtolower($color['name']) === $normalized) {
                return true;
            }
        }
        return false;
    }
}
