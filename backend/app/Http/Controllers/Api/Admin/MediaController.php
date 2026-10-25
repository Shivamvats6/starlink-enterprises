<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{ActivityLog, Banner, Media, Project, ProjectImage, Service};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index(Request $r)
    {
        $q = Media::latest();
        if ($s = $r->query('q')) $q->where(fn ($w) => $w->where('name', 'like', "%{$s}%")->orWhere('alt', 'like', "%{$s}%"));
        if ($r->boolean('all')) return response()->json(['data' => $q->get()]);
        return $q->paginate(40);
    }

    public function store(Request $r)
    {
        $r->validate(['file' => ['required', 'file', 'max:5120', 'mimes:jpg,jpeg,png,webp,avif', 'mimetypes:image/jpeg,image/png,image/webp,image/avif'], 'alt' => ['nullable', 'string', 'max:255']]);
        $file = $r->file('file');
        $ext = strtolower($file->guessExtension() ?: 'jpg');
        $path = $file->storeAs('media/' . now()->format('Y/m'), Str::uuid() . '.' . $ext, 'public'); // generated name, never the client's
        [$w, $h] = @getimagesize($file->getRealPath()) ?: [null, null];
        $m = Media::create(['name' => Str::limit(basename($file->getClientOriginalName()), 120, ''), 'path' => $path, 'alt' => $r->input('alt'), 'size' => $file->getSize(), 'mime' => $file->getMimeType(), 'width' => $w, 'height' => $h, 'user_id' => $r->user()->id]);
        ActivityLog::record("Image \"{$m->name}\" uploaded");
        return response()->json(['data' => $m], 201);
    }

    public function update(Request $r, int $id)
    {
        $m = Media::findOrFail($id);
        $m->update($r->validate(['alt' => ['nullable', 'string', 'max:255']]));
        return response()->json(['data' => $m]);
    }

    /** Lists where an image is referenced (matched on the storage path, so absolute and relative URLs both match). */
    private function usages(Media $m): array
    {
        $like = '%' . $m->path;
        $out = [];
        foreach (Project::where('cover_image', 'like', $like)->get(['title']) as $p) $out[] = "project \"{$p->title}\"";
        foreach (ProjectImage::where('url', 'like', $like)->with('project:id,title')->get() as $i) $out[] = "project \"" . ($i->project?->title ?? '?') . "\"";
        foreach (Banner::where('desktop_image', 'like', $like)->orWhere('mobile_image', 'like', $like)->get(['heading']) as $b) $out[] = "banner \"{$b->heading}\"";
        foreach (Service::where('cover_image', 'like', $like)->get(['title']) as $x) $out[] = "service \"{$x->title}\"";
        return array_values(array_unique($out));
    }

    public function destroy(Request $r, int $id)
    {
        $m = Media::findOrFail($id);
        if (! $r->boolean('force') && ($used = $this->usages($m))) {
            return response()->json(['message' => 'This image is used by ' . implode(', ', $used) . '.', 'used_by' => $used], 409);
        }
        Storage::disk('public')->delete($m->path);
        $m->delete();
        ActivityLog::record("Image \"{$m->name}\" deleted");
        return response()->noContent();
    }
}
