<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('banners', 'mobile_image')) {
            Schema::table('banners', function (Blueprint $t) {
                $t->string('mobile_image', 2048)->nullable()->after('desktop_image');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('banners', 'mobile_image')) {
            Schema::table('banners', function (Blueprint $t) {
                $t->dropColumn('mobile_image');
            });
        }
    }
};