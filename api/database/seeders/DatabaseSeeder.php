<?php

namespace Database\Seeders;

use App\Models\{Banner, Category, Page, Service};
use Illuminate\Database\Seeder;

/** Safe, idempotent baseline content. No fake projects, testimonials, leads or admin users. */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['Retail Fit-Out', 'retail-fit-out'], ['Commercial', 'commercial'], ['Interior Fit-Out', 'interior-fit-out']] as [$n, $s]) {
            Category::firstOrCreate(['slug' => $s], ['name' => $n]);
        }

        $services = [
            ['Civil Execution', 'Building2', 'Structural work, flooring, partitions and finishing with precision.', ['Structural modifications', 'Flooring', 'Partitions', 'Ceiling and finishing']],
            ['MEP Solutions', 'Settings', 'HVAC, electrical, plumbing and fire-fighting systems.', ['HVAC', 'Electrical', 'Plumbing', 'Fire-fighting']],
            ['Interior Fit-Outs', 'PaintRoller', 'Engaging, brand-driven interiors for retail and commercial spaces.', ['Fixtures', 'Furniture', 'Branding elements']],
            ['Retail Fit-Outs', 'Store', 'Functional, brand-aligned retail environments.', ['Store layout', 'Display fixtures', 'Lighting']],
            ['Commercial Spaces', 'Briefcase', 'Offices and commercial spaces built for performance.', ['Workspace planning', 'Services integration']],
            ['Project Management', 'Workflow', 'End-to-end coordination and execution.', ['Planning', 'Vendor coordination', 'Quality control']],
            ['Turnkey Projects', 'Layers', 'One team, complete project from concept to handover.', ['Design coordination', 'Execution', 'Handover']],
        ];
        foreach ($services as $i => [$title, $icon, $short, $scope]) {
            Service::firstOrCreate(['slug' => \Illuminate\Support\Str::slug($title)], [
                'title' => $title, 'icon' => $icon, 'short_description' => $short, 'description' => $short, 'scope' => $scope, 'display_order' => $i + 1, 'is_published' => true,
            ]);
        }

        Banner::firstOrCreate(['heading' => 'Retail & *Commercial* Spaces.'], [
            'eyebrow' => 'Turnkey Execution For',
            'subheading' => 'Civil, MEP and interior fit-outs — managed by one team, start to finish.',
            'cta_label' => 'Our Services', 'cta_url' => '/services', 'secondary_cta_label' => 'View Projects', 'secondary_cta_url' => '/projects',
            'desktop_image' => '/assets/home-banner.png', 'mobile_image' => '/assets/home-banner.png', 'display_order' => 1, 'is_active' => true,
        ]);

        foreach ([['Privacy Policy', 'privacy-policy'], ['Terms & Conditions', 'terms-and-conditions']] as [$t, $s]) {
            Page::firstOrCreate(['slug' => $s], ['title' => $t, 'content' => '', 'is_published' => true]);
        }
    }
}
