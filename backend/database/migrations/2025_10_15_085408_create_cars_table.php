<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $t) {
            $t->uuid('id')->primary();

            // Optional owner (seller) if you want to tie to a user
            $t->foreignUuid('seller_id')->nullable()
              ->constrained('users')->nullOnDelete();

            $t->string('make', 100);
            $t->string('model', 100);
            $t->unsignedSmallInteger('year');              // 0–65535
            $t->decimal('price', 12, 2);
            $t->unsignedInteger('mileage')->nullable();
            $t->enum('condition', ['new','used','certified']);
            $t->string('location', 150)->nullable();
            $t->text('description')->nullable();

            $t->timestamps();
            $t->softDeletes();

            // helpful indexes
            $t->index(['make','model']);
            $t->index('year');
            $t->index('price');
            $t->index('condition');
            $t->index('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
