<?php

namespace App\Http\Controllers;

use App\Models\{Project, Service};

class SeoController extends Controller
{
    public function sitemap()
    {
        $base = rtrim(config('starlink.frontend_url') ?: config('app.url'), '/');
        $urls = collect(['/', '/about-us', '/services', '/projects', '/our-process', '/why-choose-us', '/contact'])->map(fn ($p) => [$base . $p, null]);
        $urls = $urls->concat(Service::where('is_published', true)->get()->map(fn ($s) => ["$base/services/{$s->slug}", $s->updated_at]));
        $urls = $urls->concat(Project::published()->with('seoMeta')->get()->reject(fn ($p) => $p->seoMeta?->noindex)->map(fn ($p) => ["$base/projects/{$p->slug}", $p->updated_at]));
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as [$loc, $mod]) $xml .= '<url><loc>' . e($loc) . '</loc>' . ($mod ? '<lastmod>' . $mod->toDateString() . '</lastmod>' : '') . '</url>';
        return response($xml . '</urlset>', 200, ['Content-Type' => 'application/xml']);
    }

    public function robots()
    {
        $base = rtrim(config('starlink.frontend_url') ?: config('app.url'), '/');
        return response("User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: {$base}/sitemap.xml\n", 200, ['Content-Type' => 'text/plain']);
    }
}
