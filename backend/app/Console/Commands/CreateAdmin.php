<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdmin extends Command
{
    protected $signature = 'starlink:create-admin {email} {name=Admin} {--role=super_admin}';
    protected $description = 'Create (or reset the password of) an admin user. The password is prompted, never stored in code.';

    public function handle(): int
    {
        $password = $this->secret('Password (min 12 characters)');
        $v = Validator::make(['email' => $this->argument('email'), 'password' => $password, 'role' => $this->option('role')], [
            'email' => ['required', 'email'], 'password' => ['required', 'min:12'], 'role' => ['in:super_admin,admin,editor'],
        ]);
        if ($v->fails()) { $this->error($v->errors()->first()); return self::FAILURE; }

        $user = User::firstOrNew(['email' => $this->argument('email')]);
        $user->forceFill(['name' => $this->argument('name'), 'password' => Hash::make($password), 'role' => $this->option('role')])->save();
        $this->info("Admin {$user->email} ({$user->role}) is ready.");
        return self::SUCCESS;
    }
}
