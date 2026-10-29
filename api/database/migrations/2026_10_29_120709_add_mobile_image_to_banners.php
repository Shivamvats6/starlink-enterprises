<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $t) {
            $t->string('mobile_image', 2048)->nullable()->after('desktop_image');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $t) {
            $t->dropColumn('mobile_image');
        });
    }
};
