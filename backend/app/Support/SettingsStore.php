<?php

namespace App\Support;

use App\Models\Setting;

/** Key/value site settings merged over config('starlink_defaults'). */
class SettingsStore
{
    public static function all(): array
    {
        $stored = Setting::query()->pluck('value', 'key')->all();
        return array_replace(config('starlink_defaults'), $stored);
    }

    public static function save(array $data): array
    {
        $allowed = array_keys(config('starlink_defaults'));
        foreach (array_intersect_key($data, array_flip($allowed)) as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return self::all();
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::all()[$key] ?? $default;
    }
}
