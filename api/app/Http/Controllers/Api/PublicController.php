<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\ProjectResource;
use App\Mail\LeadReceived;
use App\Models\{Banner, Category, Lead, LeadEvent, Page, Project, Service, Testimonial};
use App\Support\SettingsStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PublicController extends Controller
{
    private function projectQuery()
    {
        return Project::published()->with(['category', 'images', 'scopeItems', 'results', 'seoMeta']);
    }

    public function home()
    {
        return response()->json([
            'banners' => Banner::where('is_active', true)->orderBy('display_order')->get(),
            'services' => Service::where('is_published', true)->orderBy('display_order')->get(),
            'featured_projects' => ProjectResource::collection($this->projectQuery()->where('is_featured', true)->latest('published_at')->limit(6)->get())->resolve(),
            'testimonials' => Testimonial::where('is_approved', true)->latest()->get(),
            'settings' => SettingsStore::all(),
        ]);
    }

    public function settings() { return response()->json(SettingsStore::all()); }

    public function banners() { return response()->json(['data' => Banner::where('is_active', true)->orderBy('display_order')->get()]); }

    public function services(Request $r)
    {
        return response()->json(['data' => Service::where('is_published', true)->orderBy('display_order')->get()]);
    }

    public function service(string $slug)
    {
        return response()->json(['data' => Service::where('is_published', true)->where('slug', $slug)->firstOrFail()]);
    }

    public function categories() { return response()->json(['data' => Category::orderBy('name')->get()]); }

    public function projects(Request $r)
    {
        $q = $this->projectQuery();
        if ($s = $r->query('q')) $q->where(fn ($w) => $w->where('title', 'like', "%{$s}%")->orWhere('location', 'like', "%{$s}%"));
        if ($c = $r->query('category')) $q->whereHas('category', fn ($w) => $w->where('slug', $c)->orWhere('id', $c));
        if ($l = $r->query('location')) $q->where('location', 'like', "%{$l}%");
        if ($e = $r->query('exclude')) $q->where('slug', '!=', $e);
        if ($r->boolean('featured')) $q->where('is_featured', true);
        $q->latest('published_at');
        $per = min(max((int) $r->query('per_page', 12), 1), 50);
        return ProjectResource::collection($q->paginate($per));
    }

    public function project(string $slug)
    {
        return new ProjectResource($this->projectQuery()->where('slug', $slug)->firstOrFail());
    }

    public function testimonials() { return response()->json(['data' => Testimonial::where('is_approved', true)->latest()->get()]); }

    public function page(string $slug)
    {
        return response()->json(['data' => Page::where('is_published', true)->where('slug', $slug)->firstOrFail()]);
    }

    public function storeLead(StoreLeadRequest $request)
    {
        $lead = Lead::create($request->safe()->except(['consent']) + ['status' => 'New', 'ip_address' => $request->ip()]);
        LeadEvent::create(['lead_id' => $lead->id, 'text' => 'Enquiry received']);

        try {
            $to = SettingsStore::get('notification_email') ?: config('mail.from.address');
            Mail::to($to)->send(new LeadReceived($lead));
        } catch (\Throwable $e) {
            // The enquiry is already stored; never fail the visitor because of SMTP issues.
            Log::warning('Lead notification email failed', ['lead_id' => $lead->id, 'error' => $e->getMessage()]);
        }

        return response()->json(['message' => 'Thank you. Your enquiry has been received and our team will contact you shortly.'], 201);
    }
}
