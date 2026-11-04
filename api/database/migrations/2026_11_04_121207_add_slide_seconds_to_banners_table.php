<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $t) {
            $t->unsignedTinyInteger('slide_seconds')->default(6)->after('focal_y');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $t) {
            $t->dropColumn('slide_seconds');
        });
    }
};