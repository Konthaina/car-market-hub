<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Tests\TestCase;

class AdminRoleTest extends TestCase
{
    /**
     * Test that admin role exists and has all permissions
     */
    public function test_admin_role_has_all_permissions()
    {
        $adminRole = Role::where('name', 'admin')->first();
        $this->assertNotNull($adminRole, 'Admin role does not exist');

        // Get all permissions
        $allPermissions = Permission::all();
        $adminPermissions = $adminRole->permissions()->pluck('name')->toArray();

        // Admin should have all permissions
        foreach ($allPermissions as $permission) {
            $this->assertContains(
                $permission->name,
                $adminPermissions,
                "Admin role missing permission: {$permission->name}"
            );
        }
    }

    /**
     * Test that admin user can be created and has admin role
     */
    public function test_admin_user_exists_with_admin_role()
    {
        $adminUser = User::where('email', 'admin@example.com')->first();
        $this->assertNotNull($adminUser, 'Admin user does not exist');

        $roles = $adminUser->roles()->pluck('name')->toArray();
        $this->assertContains('admin', $roles, 'Admin user does not have admin role');
    }

    /**
     * Test admin can upload car images
     */
    public function test_admin_can_upload_car_images()
    {
        $adminUser = User::where('email', 'admin@example.com')->first();
        $this->assertNotNull($adminUser, 'Admin user does not exist');

        // Create a test car
        $car = \App\Models\Car::factory()->create(['seller_id' => $adminUser->id]);

        // Admin should have cars.update permission
        $hasPermission = $adminUser->permissions()
            ->where('name', 'cars.update')
            ->exists();

        $this->assertTrue($hasPermission, 'Admin does not have cars.update permission');
    }

    /**
     * Test admin can approve cars
     */
    public function test_admin_has_moderation_permission()
    {
        $adminUser = User::where('email', 'admin@example.com')->first();
        $this->assertNotNull($adminUser);

        $hasPermission = $adminUser->permissions()
            ->where('name', 'cars.moderate')
            ->exists();

        $this->assertTrue($hasPermission, 'Admin does not have cars.moderate permission');
    }

    /**
     * Test admin can manage users
     */
    public function test_admin_has_user_management_permissions()
    {
        $adminUser = User::where('email', 'admin@example.com')->first();
        $this->assertNotNull($adminUser);

        $requiredPermissions = ['users.view', 'users.manage'];
        $adminPermissions = $adminUser->permissions()->pluck('name')->toArray();

        foreach ($requiredPermissions as $perm) {
            $this->assertContains(
                $perm,
                $adminPermissions,
                "Admin does not have {$perm} permission"
            );
        }
    }
}
