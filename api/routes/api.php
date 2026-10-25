<?php

use App\Http\Controllers\Api\Admin\{DashboardController, LeadController, MediaController, ProjectController, ResourceController};
use App\Http\Controllers\Api\{AuthController, PublicController};
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

RateLimiter::for('leads', fn (Request $r) => [Limit::perMinute(3)->by($r->ip()), Limit::perHour(20)->by($r->ip())]);
RateLimiter::for('admin-login', fn (Request $r) => Limit::perMinute(5)->by(strtolower((string) $r->input('email')) . '|' . $r->ip()));

Route::prefix('v1')->group(function () {
    // ---- public
    Route::get('home', [PublicController::class, 'home']);
    Route::get('settings', [PublicController::class, 'settings']);
    Route::get('banners', [PublicController::class, 'banners']);
    Route::get('services', [PublicController::class, 'services']);
    Route::get('services/{slug}', [PublicController::class, 'service']);
    Route::get('categories', [PublicController::class, 'categories']);
    Route::get('projects', [PublicController::class, 'projects']);
    Route::get('projects/{slug}', [PublicController::class, 'project']);
    Route::get('pages/{slug}', [PublicController::class, 'page']);
    Route::get('testimonials', [PublicController::class, 'testimonials']);
    Route::post('leads', [PublicController::class, 'storeLead'])->middleware('throttle:leads');

    // ---- admin auth (Sanctum SPA cookie session)
    Route::post('admin/login', [AuthController::class, 'login'])->middleware('throttle:admin-login');

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('dashboard', [DashboardController::class, 'dashboard']);
        Route::get('settings', [DashboardController::class, 'settings']);
        Route::put('settings', [DashboardController::class, 'saveSettings']);

        Route::get('projects', [ProjectController::class, 'index']);
        Route::post('projects', [ProjectController::class, 'store']);
        Route::get('projects/{id}', [ProjectController::class, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], 'projects/{id}', [ProjectController::class, 'update'])->whereNumber('id');
        Route::delete('projects/{id}', [ProjectController::class, 'destroy'])->whereNumber('id');

        Route::get('leads', [LeadController::class, 'index']);
        Route::get('leads/{id}', [LeadController::class, 'show'])->whereNumber('id');
        Route::match(['put', 'patch'], 'leads/{id}', [LeadController::class, 'update'])->whereNumber('id');
        Route::delete('leads/{id}', [LeadController::class, 'destroy'])->whereNumber('id');

        Route::get('media', [MediaController::class, 'index']);
        Route::post('media', [MediaController::class, 'store']);
        Route::match(['put', 'patch'], 'media/{id}', [MediaController::class, 'update'])->whereNumber('id');
        Route::delete('media/{id}', [MediaController::class, 'destroy'])->whereNumber('id');

        foreach (['services', 'categories', 'banners', 'testimonials', 'team', 'pages'] as $res) {
            Route::get($res, [ResourceController::class, 'index'])->defaults('resource', $res);
            Route::post($res, [ResourceController::class, 'store'])->defaults('resource', $res);
            Route::get("$res/{id}", [ResourceController::class, 'show'])->whereNumber('id')->defaults('resource', $res);
            Route::match(['put', 'patch'], "$res/{id}", [ResourceController::class, 'update'])->whereNumber('id')->defaults('resource', $res);
            Route::delete("$res/{id}", [ResourceController::class, 'destroy'])->whereNumber('id')->defaults('resource', $res);
        }
    });
});
