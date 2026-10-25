<?php

namespace App\Http\Controllers;

use App\Models\{Page, Project, Service};
use App\Support\SettingsStore;
use Illuminate\Http\Request;

/**
 * Serves the built React index.html with per-page <title>/meta/Open Graph tags injected,
 * so crawlers and link-preview bots (WhatsApp, LinkedIn, Facebook) see real metadata without running JS.
 * Point SPA_INDEX_PATH at the built frontend/dist/index.html (default: public/spa/index.html).
 */
class SpaController extends Controller
{
    public function __invoke(Request $request, ?string $any = null)
    {
        $file = config('starlink.spa_index');
        abort_unless(is_file($file), 404, 'Frontend build not found.');

        $html = file_get_contents($file);
        $meta = $this->metaFor('/' . trim((string) $any, '/'));
        $s = SettingsStore::all();
        $base = rtrim(config('starlink.frontend_url') ?: $request->getSchemeAndHttpHost(), '/');

        $title = $meta['title'] ? $meta['title'] . ' | ' . $s['company_name'] : $s['default_meta_title'];
        $desc = $meta['description'] ?: $s['default_meta_description'];
        $image = $meta['image'] ?: ($s['default_og_image'] ?? null);
        $image = $image && ! preg_match('#^https?://#', $image) ? $base . '/' . ltrim($image, '/') : $image;
        $url = $meta['canonical'] ?: $base . ($any ? '/' . ltrim($any, '/') : '/');

        $tags = collect([
            '<meta name="description" content="' . e($desc) . '">',
            '<meta name="robots" content="' . ($meta['noindex'] ? 'noindex, nofollow' : 'index, follow') . '">',
            '<link rel="canonical" href="' . e($url) . '">',
            '<meta property="og:type" content="website">',
            '<meta property="og:title" content="' . e($title) . '">',
            '<meta property="og:description" content="' . e($desc) . '">',
            '<meta property="og:url" content="' . e($url) . '">',
            $image ? '<meta property="og:image" content="' . e($image) . '">' : null,
            '<meta name="twitter:card" content="summary_large_image">',
        ])->filter()->implode("\n    ");

        $html = preg_replace('#<title>.*?</title>#is', '<title>' . e($title) . '</title>', $html, 1);
        $html = str_replace('</head>', "    {$tags}\n  </head>", $html);

        return response($html, $meta['found'] ? 200 : 404)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function metaFor(string $path): array
    {
        $m = ['title' => null, 'description' => null, 'image' => null, 'canonical' => null, 'noindex' => false, 'found' => true];
        $static = ['/' => null, '/about-us' => 'About Us', '/services' => 'Services', '/projects' => 'Projects', '/our-process' => 'Our Process', '/why-choose-us' => 'Why Choose Us', '/contact' => 'Contact Us'];
        if (array_key_exists($path, $static)) { $m['title'] = $static[$path]; return $m; }

        if (preg_match('#^/projects/([a-z0-9-]+)$#', $path, $x)) {
            $p = Project::published()->with('seoMeta')->where('slug', $x[1])->first();
            return $p ? $this->fill($m, $p->seoMeta, $p->title, $p->short_description, $p->cover_image) : ['found' => false, 'noindex' => true] + $m;
        }
        if (preg_match('#^/services/([a-z0-9-]+)$#', $path, $x)) {
            $sv = Service::where('is_published', true)->with('seoMeta')->where('slug', $x[1])->first();
            return $sv ? $this->fill($m, $sv->seoMeta, $sv->title, $sv->short_description, $sv->cover_image) : ['found' => false, 'noindex' => true] + $m;
        }
        if (in_array($path, ['/privacy-policy', '/terms-and-conditions'], true)) {
            $pg = Page::where('is_published', true)->with('seoMeta')->where('slug', ltrim($path, '/'))->first();
            return $pg ? $this->fill($m, $pg->seoMeta, $pg->title, null, null) : $m;
        }
        return ['found' => false, 'noindex' => true] + $m;
    }

    private function fill(array $m, $seo, ?string $title, ?string $desc, ?string $image): array
    {
        return [
            'title' => $seo?->meta_title ?: $title, 'description' => $seo?->meta_description ?: $desc, 'image' => $seo?->og_image ?: $image,
            'canonical' => $seo?->canonical_url, 'noindex' => (bool) $seo?->noindex, 'found' => true,
        ];
    }
}
