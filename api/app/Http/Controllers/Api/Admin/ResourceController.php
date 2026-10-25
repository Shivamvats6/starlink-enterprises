<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{ActivityLog, Banner, Category, Page, Service, TeamMember, Testimonial};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** One controller for the simple CRUD modules. The route supplies a `resource` default. */
class ResourceController extends Controller
{
    private function config(string $name, ?int $id = null): array
    {
        $img = ['nullable', 'string', 'max:2048', 'regex:/^(\/|https?:\/\/)/'];
        $seo = ['seo' => ['sometimes', 'array'], 'seo.meta_title' => ['nullable', 'string', 'max:70'], 'seo.meta_description' => ['nullable', 'string', 'max:170'], 'seo.canonical_url' => ['nullable', 'url'], 'seo.noindex' => ['boolean']];
        return match ($name) {
            'services' => ['model' => Service::class, 'order' => ['display_order', 'asc'], 'seo' => true, 'rules' => [
                'title' => ['required', 'string', 'max:255'], 'slug' => ['required', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('services', 'slug')->ignore($id)],
                'short_description' => ['nullable', 'string', 'max:500'], 'description' => ['nullable', 'string', 'max:20000'], 'icon' => ['nullable', 'string', 'max:64'],
                'cover_image' => $img, 'scope' => ['array'], 'scope.*' => ['string', 'max:255'], 'display_order' => ['integer', 'min:0'], 'is_published' => ['boolean']] + $seo],
            'categories' => ['model' => Category::class, 'order' => ['name', 'asc'], 'rules' => [
                'name' => ['required', 'string', 'max:255'], 'slug' => ['nullable', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('project_categories', 'slug')->ignore($id)]]],
            'banners' => ['model' => Banner::class, 'order' => ['display_order', 'asc'], 'rules' => [
                'eyebrow' => ['nullable', 'string', 'max:80'], 'heading' => ['required', 'string', 'max:255'], 'subheading' => ['nullable', 'string', 'max:1000'], 'cta_label' => ['nullable', 'string', 'max:64'], 'cta_url' => ['nullable', 'string', 'max:2048'],
                'secondary_cta_label' => ['nullable', 'string', 'max:64'], 'secondary_cta_url' => ['nullable', 'string', 'max:2048'], 'desktop_image' => $img, 'mobile_image' => $img,
                'focal_x' => ['integer', 'between:0,100'], 'focal_y' => ['integer', 'between:0,100'], 'display_order' => ['integer', 'min:0'], 'is_active' => ['boolean']]],
            'testimonials' => ['model' => Testimonial::class, 'order' => ['id', 'desc'], 'rules' => [
                'name' => ['required', 'string', 'max:255'], 'role' => ['nullable', 'string', 'max:255'], 'location' => ['nullable', 'string', 'max:255'],
                'quote' => ['required', 'string', 'max:2000'], 'rating' => ['integer', 'between:1,5'], 'is_approved' => ['boolean']]],
            'team' => ['model' => TeamMember::class, 'order' => ['id', 'asc'], 'rules' => [
                'name' => ['required', 'string', 'max:255'], 'role' => ['required', 'string', 'max:255'], 'photo' => $img, 'is_published' => ['boolean']]],
            'pages' => ['model' => Page::class, 'order' => ['title', 'asc'], 'seo' => true, 'rules' => [
                'title' => ['required', 'string', 'max:255'], 'slug' => ['required', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('pages', 'slug')->ignore($id)],
                'content' => ['nullable', 'string', 'max:100000'], 'is_published' => ['boolean']] + $seo],
            default => abort(404),
        };
    }

    private function name(Request $r): string { return $r->route()->defaults['resource'] ?? abort(404); }

    private function find(array $c, int $id) { return ($c['model'])::when($c['seo'] ?? false, fn ($q) => $q->with('seoMeta'))->findOrFail($id); }

    public function index(Request $r)
    {
        $c = $this->config($this->name($r));
        $q = ($c['model'])::query()->when($c['seo'] ?? false, fn ($q) => $q->with('seoMeta'))->orderBy(...$c['order']);
        if ($r->boolean('all')) return response()->json(['data' => $q->get()]);
        return $q->paginate(min(max((int) $r->query('per_page', 20), 1), 100));
    }

    public function show(Request $r, int $id)
    {
        return response()->json(['data' => $this->find($this->config($this->name($r), $id), $id)]);
    }

    public function store(Request $r)
    {
        $name = $this->name($r); $c = $this->config($name);
        $data = $r->validate($c['rules']);
        $model = ($c['model'])::create(collect($data)->except('seo')->all());
        if ($c['seo'] ?? false) $model->syncSeo($data['seo'] ?? null);
        ActivityLog::record(ucfirst(rtrim($name, 's')) . ' "' . ($model->title ?? $model->name ?? $model->heading) . '" added');
        return response()->json(['data' => $this->find($c, $model->id)], 201);
    }

    public function update(Request $r, int $id)
    {
        $name = $this->name($r); $c = $this->config($name, $id);
        $model = $this->find($c, $id);
        $data = $r->validate(collect($c['rules'])->map(fn ($rule) => $rule)->all());
        $model->update(collect($data)->except('seo')->all());
        if ($c['seo'] ?? false) $model->syncSeo($data['seo'] ?? null);
        ActivityLog::record(ucfirst(rtrim($name, 's')) . ' "' . ($model->title ?? $model->name ?? $model->heading) . '" updated');
        return response()->json(['data' => $this->find($c, $id)]);
    }

    public function destroy(Request $r, int $id)
    {
        $name = $this->name($r); $model = $this->find($this->config($name), $id);
        $model->delete();
        ActivityLog::record(ucfirst(rtrim($name, 's')) . ' deleted');
        return response()->noContent();
    }
}
