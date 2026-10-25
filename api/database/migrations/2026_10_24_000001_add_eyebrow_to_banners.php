<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $t) {
            $t->string('eyebrow', 80)->nullable()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $t) {
            $t->dropColumn('eyebrow');
        });
    }
};
