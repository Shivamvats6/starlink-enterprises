<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    // Built React index.html that SpaController injects SEO tags into.
    'spa_index' => env('SPA_INDEX_PATH', public_path('spa/index.html')),
];
