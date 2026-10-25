<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; } // route is behind auth:sanctum + admin middleware

    public function rules(): array
    {
        $id = $this->route('id');
        $url = ['nullable', 'string', 'max:2048', 'regex:/^(\/|https?:\/\/)/'];
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('projects', 'slug')->ignore($id)],
            'short_description' => ['required', 'string', 'max:300'],
            'category_id' => ['nullable', 'integer', 'exists:project_categories,id'],
            'client_name' => ['nullable', 'string', 'max:255'], 'location' => ['required', 'string', 'max:255'],
            'project_type' => ['nullable', 'string', 'max:255'], 'area' => ['nullable', 'string', 'max:32'], 'area_unit' => ['nullable', 'string', 'max:16'],
            'duration' => ['nullable', 'string', 'max:64'], 'completion_year' => ['nullable', 'digits:4'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])], 'is_featured' => ['boolean'], 'published_at' => ['nullable', 'date'],
            'cover_image' => $url, 'video_url' => ['nullable', 'url', 'max:2048'],
            'highlights' => ['array', 'max:12'], 'highlights.*' => ['nullable', 'string', 'max:255'],
            'about_heading' => ['nullable', 'string', 'max:255'], 'about_description' => ['nullable', 'string', 'max:20000'],
            'objectives' => ['nullable', 'string', 'max:5000'], 'design_approach' => ['nullable', 'string', 'max:5000'], 'execution_details' => ['nullable', 'string', 'max:5000'],
            'gallery' => ['array', 'max:60'], 'gallery.*.url' => ['required', 'string', 'max:2048', 'regex:/^(\/|https?:\/\/)/'], 'gallery.*.alt' => ['nullable', 'string', 'max:255'],
            'scope' => ['array', 'max:24'], 'scope.*.title' => ['required', 'string', 'max:255'], 'scope.*.description' => ['nullable', 'string', 'max:500'], 'scope.*.icon' => ['nullable', 'string', 'max:64'],
            'results' => ['array', 'max:12'], 'results.*.value' => ['required', 'string', 'max:64'], 'results.*.title' => ['required', 'string', 'max:255'], 'results.*.description' => ['nullable', 'string', 'max:500'], 'results.*.icon' => ['nullable', 'string', 'max:64'],
            'seo' => ['array'], 'seo.meta_title' => ['nullable', 'string', 'max:70'], 'seo.meta_description' => ['nullable', 'string', 'max:170'],
            'seo.focus_keyword' => ['nullable', 'string', 'max:255'], 'seo.canonical_url' => ['nullable', 'url', 'max:2048'], 'seo.og_image' => $url, 'seo.noindex' => ['boolean'],
        ];
    }
}
