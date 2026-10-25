<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function payload($u): array
    {
        return ['user' => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => ucwords(str_replace('_', ' ', $u->role))]];
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        if (! Auth::guard('web')->attempt($data)) {
            throw ValidationException::withMessages(['email' => ['These credentials do not match our records.']]);
        }
        $request->session()->regenerate();
        ActivityLog::record('Admin signed in');
        return response()->json($this->payload(Auth::guard('web')->user()));
    }

    public function me(Request $request) { return response()->json($this->payload($request->user())); }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->noContent();
    }
}
