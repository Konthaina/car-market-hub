<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name')->unique();          // e.g. admin, seller, buyer
            $t->string('label')->nullable();       // human label
            $t->timestamps();
        });

        Schema::create('permissions', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name')->unique();          // e.g. cars.create
            $t->string('label')->nullable();
            $t->timestamps();
        });

        Schema::create('role_user', function (Blueprint $t) {
            $t->foreignUuid('role_id')->constrained('roles')->cascadeOnDelete();
            $t->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $t->primary(['role_id','user_id']);
        });

        Schema::create('permission_role', function (Blueprint $t) {
            $t->foreignUuid('permission_id')->constrained('permissions')->cascadeOnDelete();
            $t->foreignUuid('role_id')->constrained('roles')->cascadeOnDelete();
            $t->primary(['permission_id','role_id']);
        });

        // (Optional) direct user-permission grants
        Schema::create('permission_user', function (Blueprint $t) {
            $t->foreignUuid('permission_id')->constrained('permissions')->cascadeOnDelete();
            $t->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $t->primary(['permission_id','user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
