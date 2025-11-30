<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $t) {
            $t->string('status')->default('pending')->index(); // pending|approved|rejected
            $t->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('approved_at')->nullable();
            $t->timestamp('rejected_at')->nullable();
            $t->text('rejection_reason')->nullable();
            $t->timestamp('published_at')->nullable()->index(); // when it became public
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $t) {
            $t->dropColumn(['status','approved_at','rejected_at','rejection_reason','published_at']);
            $t->dropConstrainedForeignId('reviewed_by');
        });
    }
};
