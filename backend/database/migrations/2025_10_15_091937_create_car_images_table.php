<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('car_images', function (Blueprint $t) {
             $t->uuid('id')->primary();
             $t->foreignUuid('car_id')->constrained('cars')->cascadeOnDelete();

             $t->string('alt')->nullable();            // caption/alt text
             $t->boolean('is_cover')->default(false);  // primary image
             $t->unsignedSmallInteger('position')->default(0); // sort order

             $t->timestamps();

             $t->index(['car_id', 'position']);
             $t->index(['car_id', 'is_cover']);
         });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_images');
    }
};
