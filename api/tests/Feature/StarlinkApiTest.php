<?php

namespace Tests\Feature;

use App\Models\{Category, Lead, Project, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StarlinkApiTest extends TestCase
{
    use RefreshDatabase;

    private function project(array $o = []): Project
    {
        return Project::create($o + ['title' => 'Demo', 'slug' => 'demo', 'short_description' => 'x', 'location' => 'Noida', 'status' => 'published']);
    }

    private function admin(string $role = 'super_admin'): User
    {
        return User::factory()->create(['role' => $role]);
    }

    public function test_only_published_projects_are_public(): void
    {
        $this->project();
        $this->project(['slug' => 'secret', 'title' => 'Secret', 'status' => 'draft']);
        $this->getJson('/api/v1/projects')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/projects/secret')->assertNotFound();
        $this->getJson('/api/v1/projects/demo')->assertOk()->assertJsonPath('data.slug', 'demo');
    }

    public function test_lead_requires_valid_data_and_consent(): void
    {
        $this->postJson('/api/v1/leads', [])->assertStatus(422)->assertJsonValidationErrors(['name', 'email', 'phone', 'message', 'consent']);
    }

    public function test_lead_is_stored_after_valid_submission(): void
    {
        $this->postJson('/api/v1/leads', ['name' => 'Asha', 'email' => 'a@example.com', 'phone' => '9876543210', 'message' => 'Need a retail fit-out', 'consent' => true])->assertCreated();
        $this->assertDatabaseHas('leads', ['email' => 'a@example.com', 'status' => 'New']);
    }

    public function test_honeypot_rejects_bots(): void
    {
        $this->postJson('/api/v1/leads', ['name' => 'Bot', 'email' => 'b@example.com', 'phone' => '9876543210', 'message' => 'spam spam spam', 'consent' => true, 'website' => 'x'])->assertStatus(422);
    }

    public function test_admin_endpoints_require_authentication(): void
    {
        foreach (['dashboard', 'projects', 'leads', 'settings', 'media'] as $p) $this->getJson("/api/v1/admin/$p")->assertUnauthorized();
        $this->postJson('/api/v1/admin/projects', [])->assertUnauthorized();
    }

    public function test_editor_cannot_read_leads(): void
    {
        Lead::create(['name' => 'A', 'email' => 'a@example.com', 'phone' => '9876543210', 'message' => 'hello world!!']);
        $this->actingAs($this->admin('editor'), 'sanctum')->getJson('/api/v1/admin/leads')->assertForbidden();
        $this->actingAs($this->admin('admin'), 'sanctum')->getJson('/api/v1/admin/leads')->assertOk();
    }

    public function test_project_slug_must_be_unique(): void
    {
        $this->project();
        $cat = Category::create(['name' => 'Retail', 'slug' => 'retail']);
        $payload = ['title' => 'Other', 'slug' => 'demo', 'short_description' => 'x', 'location' => 'Delhi', 'status' => 'draft', 'category_id' => $cat->id];
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/projects', $payload)->assertStatus(422)->assertJsonValidationErrors('slug');
    }

    public function test_admin_can_create_project_with_children(): void
    {
        $payload = ['title' => 'New', 'slug' => 'new', 'short_description' => 'x', 'location' => 'Delhi', 'status' => 'published',
            'gallery' => [['url' => '/storage/media/a.jpg', 'alt' => 'a']], 'scope' => [['title' => 'Civil Works', 'icon' => 'Building2']], 'results' => [['value' => '90 Days', 'title' => 'Delivery']], 'seo' => ['meta_title' => 'Hi']];
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/projects', $payload)->assertCreated()
            ->assertJsonPath('data.gallery.0.alt', 'a')->assertJsonPath('data.seo.meta_title', 'Hi');
        $this->assertNotNull(Project::first()->published_at);
    }

    public function test_sitemap_and_robots(): void
    {
        $this->project();
        $this->get('/sitemap.xml')->assertOk()->assertSee('/projects/demo', false);
        $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /admin');
    }
}
