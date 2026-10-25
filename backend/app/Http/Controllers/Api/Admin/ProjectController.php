<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\{ActivityLog, Project};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    private const WITH = ['category', 'images', 'scopeItems', 'results', 'seoMeta'];

    public function index(Request $r)
    {
        $q = Project::with(self::WITH);
        if ($s = $r->query('q')) $q->where(fn ($w) => $w->where('title', 'like', "%{$s}%")->orWhere('location', 'like', "%{$s}%"));
        if ($st = $r->query('status')) $q->where('status', $st);
        if ($c = $r->query('category')) $q->whereHas('category', fn ($w) => $w->where('slug', $c)->orWhere('id', $c));
        $q->latest('updated_at');
        if ($r->boolean('all')) return ProjectResource::collection($q->get());
        return ProjectResource::collection($q->paginate(min(max((int) $r->query('per_page', 10), 1), 100)));
    }

    public function show(int $id) { return new ProjectResource(Project::with(self::WITH)->findOrFail($id)); }

    public function store(ProjectRequest $request)
    {
        $project = DB::transaction(fn () => $this->persist(new Project(), $request->validated()));
        ActivityLog::record("Project \"{$project->title}\" created");
        return (new ProjectResource($project->load(self::WITH)))->response()->setStatusCode(201);
    }

    public function update(ProjectRequest $request, int $id)
    {
        $project = DB::transaction(fn () => $this->persist(Project::findOrFail($id), $request->validated()));
        ActivityLog::record("Project \"{$project->title}\" updated");
        return new ProjectResource($project->load(self::WITH));
    }

    public function destroy(int $id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        ActivityLog::record("Project \"{$project->title}\" deleted");
        return response()->noContent();
    }

    private function persist(Project $project, array $d): Project
    {
        $core = collect($d)->except(['gallery', 'scope', 'results', 'seo'])->all();
        if (($core['status'] ?? null) === 'published' && empty($core['published_at']) && ! $project->published_at) {
            $core['published_at'] = now();
        }
        $project->fill($core)->save();

        $project->images()->delete();
        foreach (array_values($d['gallery'] ?? []) as $i => $g) $project->images()->create(['url' => $g['url'], 'alt' => $g['alt'] ?? null, 'sort_order' => $i]);
        $project->scopeItems()->delete();
        foreach (array_values($d['scope'] ?? []) as $i => $s) $project->scopeItems()->create(['title' => $s['title'], 'description' => $s['description'] ?? null, 'icon' => $s['icon'] ?? 'Building2', 'sort_order' => $i]);
        $project->results()->delete();
        foreach (array_values($d['results'] ?? []) as $i => $x) $project->results()->create(['value' => $x['value'], 'title' => $x['title'], 'description' => $x['description'] ?? null, 'icon' => $x['icon'] ?? 'Award', 'sort_order' => $i]);
        $project->syncSeo($d['seo'] ?? null);
        return $project;
    }
}
