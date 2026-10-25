<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\{ActivityLog, Media};
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

    public function destroy(int $id)
    {
        $m = Media::findOrFail($id);
        Storage::disk('public')->delete($m->path);
        $m->delete();
        return response()->noContent();
    }
}
