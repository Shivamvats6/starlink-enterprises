<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('banners', 'mobile_text_theme')) {
            Schema::table('banners', function (Blueprint $t) {
                $t->string('mobile_text_theme', 10)->default('dark')->after('slide_seconds'); // dark | light
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('banners', 'mobile_text_theme')) {
            Schema::table('banners', function (Blueprint $t) {
                $t->dropColumn('mobile_text_theme');
            });
        }
    }
};