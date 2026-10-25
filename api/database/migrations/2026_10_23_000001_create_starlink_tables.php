<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('editor')->after('email'); // super_admin | admin | editor
        });

        Schema::create('project_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->timestamps();
        });

        Schema::create('projects', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('short_description', 300);
            $t->foreignId('category_id')->nullable()->constrained('project_categories')->nullOnDelete();
            $t->string('client_name')->nullable();
            $t->string('location');
            $t->string('project_type')->nullable();
            $t->string('area')->nullable();
            $t->string('area_unit')->nullable();
            $t->string('duration')->nullable();
            $t->string('completion_year', 4)->nullable();
            $t->string('status')->default('draft')->index(); // draft | published | archived
            $t->boolean('is_featured')->default(false)->index();
            $t->timestamp('published_at')->nullable();
            $t->string('cover_image', 2048)->nullable();
            $t->string('video_url', 2048)->nullable();
            $t->json('highlights')->nullable();
            $t->string('about_heading')->nullable();
            $t->text('about_description')->nullable();
            $t->text('objectives')->nullable();
            $t->text('design_approach')->nullable();
            $t->text('execution_details')->nullable();
            $t->timestamps();
        });

        Schema::create('project_images', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->string('url', 2048);
            $t->string('alt')->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('project_scope_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->string('title');
            $t->string('description', 500)->nullable();
            $t->string('icon')->default('Building2');
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('project_results', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->string('value');
            $t->string('title');
            $t->string('description', 500)->nullable();
            $t->string('icon')->default('Award');
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });

        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('short_description', 500)->nullable();
            $t->text('description')->nullable();
            $t->string('icon')->default('Wrench');
            $t->string('cover_image', 2048)->nullable();
            $t->json('scope')->nullable();
            $t->unsignedInteger('display_order')->default(0);
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        });

        Schema::create('banners', function (Blueprint $t) {
            $t->id();
            $t->string('heading');
            $t->text('subheading')->nullable();
            $t->string('cta_label')->nullable();
            $t->string('cta_url')->nullable();
            $t->string('secondary_cta_label')->nullable();
            $t->string('secondary_cta_url')->nullable();
            $t->string('desktop_image', 2048)->nullable();
            $t->string('mobile_image', 2048)->nullable();
            $t->unsignedTinyInteger('focal_x')->default(50);
            $t->unsignedTinyInteger('focal_y')->default(50);
            $t->unsignedInteger('display_order')->default(0);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('pages', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->longText('content')->nullable();
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('role')->nullable();
            $t->string('location')->nullable();
            $t->text('quote');
            $t->unsignedTinyInteger('rating')->default(5);
            $t->boolean('is_approved')->default(false);
            $t->timestamps();
        });

        Schema::create('team_members', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('role');
            $t->string('photo', 2048)->nullable();
            $t->boolean('is_published')->default(false);
            $t->timestamps();
        });

        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('company')->nullable();
            $t->string('email')->index();
            $t->string('phone', 32);
            $t->string('project_type')->nullable();
            $t->string('location')->nullable();
            $t->string('budget')->nullable();
            $t->text('message');
            $t->string('status')->default('New')->index();
            $t->string('assigned_to')->nullable();
            $t->date('follow_up_date')->nullable();
            $t->string('ip_address', 45)->nullable();
            $t->timestamps();
        });

        Schema::create('lead_notes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->text('text');
            $t->timestamps();
        });

        Schema::create('lead_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->string('text');
            $t->timestamps();
        });

        Schema::create('seo_metadata', function (Blueprint $t) {
            $t->id();
            $t->morphs('seoable');
            $t->string('meta_title')->nullable();
            $t->string('meta_description', 300)->nullable();
            $t->string('focus_keyword')->nullable();
            $t->string('canonical_url', 2048)->nullable();
            $t->string('og_image', 2048)->nullable();
            $t->boolean('noindex')->default(false);
            $t->timestamps();
            $t->unique(['seoable_type', 'seoable_id']);
        });

        Schema::create('media', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('path');
            $t->string('alt')->nullable();
            $t->unsignedBigInteger('size');
            $t->string('mime', 64);
            $t->unsignedInteger('width')->nullable();
            $t->unsignedInteger('height')->nullable();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->json('value')->nullable();
            $t->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('text');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['activity_logs','settings','media','seo_metadata','lead_events','lead_notes','leads','team_members','testimonials','pages','banners','services','project_results','project_scope_items','project_images','projects','project_categories'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
    }
};
