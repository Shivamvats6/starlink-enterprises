<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        abort_unless($user && in_array($user->role, ['super_admin', 'admin', 'editor'], true), 403, 'Forbidden.');
        // Lead contact data and settings are limited to admins.
        if ($request->is('api/v1/admin/leads*', 'api/v1/admin/settings*', 'api/v1/admin/team*')) {
            abort_unless(in_array($user->role, ['super_admin', 'admin'], true), 403, 'Forbidden.');
        }
        return $next($request);
    }
}
