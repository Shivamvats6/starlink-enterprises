<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphOne;

/** Shared SEO behaviour: seo_metadata row exposed as a `seo` attribute. */
trait HasSeo
{
    public function seoMeta(): MorphOne
    {
        return $this->morphOne(SeoMetadata::class, 'seoable');
    }

    public function getSeoAttribute(): array
    {
        $m = $this->seoMeta;
        return $m ? $m->only(['meta_title', 'meta_description', 'focus_keyword', 'canonical_url', 'og_image', 'noindex']) : [];
    }

    public function syncSeo(?array $seo): void
    {
        if ($seo === null) return;
        $data = collect($seo)->only(['meta_title', 'meta_description', 'focus_keyword', 'canonical_url', 'og_image', 'noindex'])->all();
        $data['noindex'] = (bool) ($data['noindex'] ?? false);
        $this->seoMeta()->updateOrCreate([], $data);
    }
}
