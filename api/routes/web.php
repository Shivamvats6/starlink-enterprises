<?php

use App\Http\Controllers\{SeoController, SpaController};
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/robots.txt', [SeoController::class, 'robots']);

// Public SPA routes served with server-injected SEO tags. /api, /storage and assets are not matched.
// (/admin is part of the React app, so it IS served here.)
Route::get('/{any?}', SpaController::class)
    ->where('any', '^(?!api|storage|assets|sanctum|up|sitemap\.xml|robots\.txt).*$');