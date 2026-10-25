<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\{LeadResource, ProjectResource};
use App\Models\{ActivityLog, Banner, Lead, Page, Project, Service};
use App\Support\SettingsStore;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function dashboard(Request $r)
    {
        $isAdmin = in_array($r->user()->role, ['super_admin', 'admin'], true);
        return response()->json([
            'projects_total' => Project::count(), 'projects_published' => Project::published()->count(), 'projects_draft' => Project::where('status', 'draft')->count(),
            'leads_total' => $isAdmin ? Lead::count() : 0, 'leads_new' => $isAdmin ? Lead::where('status', 'New')->count() : 0,
            'services_total' => Service::count(), 'pages_published' => Page::where('is_published', true)->count(),
            'recent_leads' => $isAdmin ? LeadResource::collection(Lead::with(['notes', 'events'])->latest()->limit(5)->get())->resolve() : [],
            'recent_projects' => ProjectResource::collection(Project::with(['category', 'images', 'scopeItems', 'results', 'seoMeta'])->latest()->limit(3)->get())->resolve(),
            'activity' => ActivityLog::latest()->limit(8)->get()->map(fn ($a) => ['at' => $a->created_at->toIso8601String(), 'text' => $a->text]),
            'banner' => Banner::where('is_active', true)->orderBy('display_order')->first(),
            'analytics_configured' => false, // no analytics provider integrated; never invent page-view numbers
        ]);
    }

    public function settings() { return response()->json(SettingsStore::all()); }

    public function saveSettings(Request $r)
    {
        $d = $r->validate([
            'company_name' => ['sometimes', 'string', 'max:255'], 'tagline' => ['sometimes', 'string', 'max:255'], 'phone' => ['sometimes', 'string', 'max:64'], 'phone_secondary' => ['nullable', 'string', 'max:64'],
            'email' => ['sometimes', 'email'], 'email_secondary' => ['nullable', 'email'], 'notification_email' => ['sometimes', 'email'], 'address' => ['sometimes', 'string', 'max:500'],
            'working_hours' => ['sometimes', 'string', 'max:255'], 'map_url' => ['nullable', 'url'], 'whatsapp' => ['nullable', 'string', 'max:32'], 'footer_text' => ['sometimes', 'string', 'max:500'],
            'socials' => ['sometimes', 'array'], 'socials.*' => ['nullable', 'url'], 'default_meta_title' => ['sometimes', 'string', 'max:70'], 'default_meta_description' => ['sometimes', 'string', 'max:170'],
            'default_og_image' => ['nullable', 'string', 'max:2048', 'regex:/^(\/|https?:\/\/)/'],
            'stats' => ['sometimes', 'array', 'max:8'], 'stats.*.label' => ['required', 'string', 'max:64'], 'stats.*.value' => ['required', 'numeric'], 'stats.*.suffix' => ['nullable', 'string', 'max:8'],
            'process' => ['sometimes', 'array'], 'benefits' => ['sometimes', 'array'], 'regions' => ['sometimes', 'array'], 'about' => ['sometimes', 'array'], 'hero_stats' => ['sometimes', 'array'],
        ]);
        $out = SettingsStore::save($d);
        ActivityLog::record('Settings updated');
        return response()->json($out);
    }
}
