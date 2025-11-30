<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Permissions (lookup by name; set UUID in values) ----
        $permNames = [
            'cars.view', 'cars.create', 'cars.update', 'cars.delete',
            'users.view', 'users.manage','cars.moderate',
        ];

        foreach ($permNames as $name) {
            Permission::firstOrCreate(
                ['name' => $name],                                   // lookup
                ['id' => (string) Str::uuid(), 'label' => $this->labelize($name)] // values if creating
            );
        }

        // ---- Roles ----
        $roles = [
            ['name' => 'admin',  'label' => 'Administrator'],
            ['name' => 'seller', 'label' => 'Seller'],
            ['name' => 'buyer',  'label' => 'Buyer'],
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(
                ['name' => $r['name']],
                ['id' => (string) Str::uuid(), 'label' => $r['label']]
            );
        }

        // Reload fresh instances
        $adminRole  = Role::where('name', 'admin')->firstOrFail();
        $sellerRole = Role::where('name', 'seller')->firstOrFail();
        $buyerRole  = Role::where('name', 'buyer')->firstOrFail();

        $allPermIds = Permission::pluck('id')->all();
        $sellerPermIds = Permission::whereIn('name', ['cars.view','cars.create','cars.update'])->pluck('id')->all();
        $buyerPermIds  = Permission::whereIn('name', ['cars.view'])->pluck('id')->all();

        // Attach permissions to roles (sync = idempotent)
        $adminRole->permissions()->sync($allPermIds);
        $sellerRole->permissions()->sync($sellerPermIds);
        $buyerRole->permissions()->sync($buyerPermIds);

        // ---- Users (create if missing) ----
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['id' => (string) Str::uuid(), 'name' => 'Admin', 'password' => Hash::make('password')]
        );

        $sellerUser = User::firstOrCreate(
            ['email' => 'seller@example.com'],
            ['id' => (string) Str::uuid(), 'name' => 'Seller', 'password' => Hash::make('password')]
        );

        $buyerUser = User::firstOrCreate(
            ['email' => 'buyer@example.com'],
            ['id' => (string) Str::uuid(), 'name' => 'Buyer', 'password' => Hash::make('password')]
        );

        // Attach roles to users (don’t detach other roles)
        $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);
        $sellerUser->roles()->syncWithoutDetaching([$sellerRole->id]);
        $buyerUser->roles()->syncWithoutDetaching([$buyerRole->id]);
    }

    private function labelize(string $name): string
    {
        // "cars.create" -> "Cars Create"
        return collect(explode('.', $name))
            ->map(fn ($p) => ucfirst($p))
            ->implode(' ');
    }
}
