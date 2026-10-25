<?php

use App\Http\Controllers\{SeoController, SpaController};
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/robots.txt', [SeoController::class, 'robots']);

// Public SPA routes served with server-injected SEO tags. /admin, /api, /storage and assets are not matched.
Route::get('/{any?}', SpaController::class)
    ->where('any', '^(?!api|admin|storage|assets|sanctum|up|sitemap\.xml|robots\.txt).*$');
