<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * GET /api/profile
     * Get current user's profile.
     */
    public function profile(Request $request)
    {
        $user = $request->user()->load(['roles:id,name,label', 'permissions:id,name']);
        return response()->json(['data' => $user]);
    }

    /**
     * PUT /api/profile
     * Update current user's profile.
     */
    public function updateProfile(Request $request)
    {
       $user = $request->user();
       // All profile fields are optional - users can save with any combination of fields
       $data = $request->validate([
           'name'  => ['sometimes', 'nullable', 'string', 'max:100'],
           'email' => ['sometimes', 'nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
           'first_name' => ['sometimes', 'nullable', 'string', 'max:100'],
           'last_name' => ['sometimes', 'nullable', 'string', 'max:100'],
           'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
           'bio' => ['sometimes', 'nullable', 'string', 'max:500'],
           'address' => ['sometimes', 'nullable', 'string', 'max:255'],
           'city' => ['sometimes', 'nullable', 'string', 'max:100'],
           'state' => ['sometimes', 'nullable', 'string', 'max:100'],
           'postal_code' => ['sometimes', 'nullable', 'string', 'max:20'],
           'country' => ['sometimes', 'nullable', 'string', 'max:100'],
           'date_of_birth' => ['sometimes', 'nullable', 'date'],
           'gender' => ['sometimes', 'nullable', 'in:male,female,other'],
           'company_name' => ['sometimes', 'nullable', 'string', 'max:255'],
       ]);

       $user->fill($data)->save();
       
       // Update profile completion percentage
       $user->updateProfileComplete();
       
       $user = $user->fresh()->load(['roles:id,name,label', 'permissions:id,name']);
       return response()->json(['user' => $user]);
    }

    /**
     * PATCH /api/profile/password
     * Change current user's password.
     */
    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:6'],
            'password_confirmation' => ['required', 'string', 'min:6', 'same:password'],
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * GET /api/admin/users
     * List users with roles & permissions (paginated).
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);

        $users = User::query()
            ->with(['roles:id,name', 'permissions:id,name'])
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = trim((string) $request->string('q'));
                $q->where(function ($w) use ($kw) {
                    $w->where('name',  'like', "%{$kw}%")
                      ->orWhere('email','like', "%{$kw}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/admin/users-trashed
     * List soft-deleted users (paginated), like cars-trashed.
     */
    public function indexTrashed(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);

        $p = User::onlyTrashed()
            ->with(['roles:id,name', 'permissions:id,name'])
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = trim((string) $request->string('q'));
                $q->where(function ($w) use ($kw) {
                    $w->where('name',  'like', "%{$kw}%")
                      ->orWhere('email','like', "%{$kw}%");
                });
            })
            ->orderByDesc('deleted_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $p->items(),
            'meta' => [
                'current_page' => $p->currentPage(),
                'per_page'     => $p->perPage(),
                'total'        => $p->total(),
                'last_page'    => $p->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/admin/users/{user}
     * Single user with roles/permissions.
     */
    public function show(User $user)
    {
        $user->load(['roles:id,name', 'permissions:id,name']);
        return response()->json(['data' => $user]);
    }

    /**
     * PUT /api/admin/users/{user}
     * Update basic profile fields (admin edit).
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => ['sometimes','string','max:100'],
            'email' => ['sometimes','email','max:150', Rule::unique('users','email')->ignore($user->id)],
        ]);

        $user->fill($data)->save();
        return response()->json(['data' => $user]);
    }

    /**
     * PATCH /api/admin/users/{user}/roles
     * Body: { "roles": ["admin","seller"] }
     */
    public function setRoles(Request $request, User $user)
    {
        $data = $request->validate([
            'roles'   => ['required','array','min:1'],
            'roles.*' => ['string','exists:roles,name'],
        ]);

        $roleIds = Role::whereIn('name', $data['roles'])->pluck('id');
        $user->roles()->sync($roleIds);

        return response()->json(['data' => $user->load('roles:id,name')]);
    }

    /**
     * PATCH /api/admin/users/{user}/permissions
     * Body: { "permissions": ["cars.view","users.manage"] }
     */
    public function setPermissions(Request $request, User $user)
    {
        $data = $request->validate([
            'permissions'   => ['required','array'],
            'permissions.*' => ['string','exists:permissions,name'],
        ]);

        $permIds = Permission::whereIn('name', $data['permissions'])->pluck('id');
        $user->permissions()->sync($permIds);

        return response()->json(['data' => $user->load('permissions:id,name')]);
    }

    /**
     * DELETE /api/admin/users/{user}
     * Soft delete (like Car::destroy).
     * Also revoke tokens and kill DB sessions.
     */
    public function destroy(Request $request, User $user)
    {
        // prevent self-delete
        if ($request->user()->is($user)) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        // Optional cleanup on soft delete too:
        $user->tokens()->delete();
        try { DB::table('sessions')->where('user_id', $user->getKey())->delete(); } catch (\Throwable $e) {}

        return response()->json(['message' => 'User soft-deleted.']);
    }

    /**
     * PATCH /api/admin/users/{user}/restore
     * Restore soft-deleted user (works with ->withTrashed() route binding).
     */
    public function restore(User $user)
    {
        if (method_exists($user, 'trashed') && $user->trashed()) {
            $user->restore();
            return response()->json(['data' => $user->fresh()->load(['roles:id,name','permissions:id,name'])]);
        }
        return response()->json(['message' => 'User is not deleted.'], 409);
    }

    /**
     * DELETE /api/admin/users/{user}/force
     * Permanently delete user (like Car::force).
     * Cleans tokens, sessions, and RBAC pivots first.
     */
    public function force(Request $request, User $user)
    {
        // prevent self-force-delete
        if ($request->user()->is($user)) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        // 1) Revoke Sanctum tokens
        $user->tokens()->delete();

        // 2) Kill DB sessions (SESSION_DRIVER=database)
        try { DB::table('sessions')->where('user_id', $user->getKey())->delete(); } catch (\Throwable $e) {}

        // 3) Detach RBAC pivots
        $user->roles()->detach();
        $user->permissions()->detach();

        // 4) Force delete record
        if (method_exists($user, 'forceDelete')) {
            $user->forceDelete();
        } else {
            $user->delete();
        }

        return response()->json(['message' => 'User permanently deleted.']);
    }

    /**
     * POST /api/admin/users/{user}/upload-image
     * Upload profile image for a user (admin endpoint).
     */
    public function uploadImage(Request $request, User $user)
    {
        $data = $request->validate([
            'image' => ['required', 'image', 'max:5120'], // 5MB
        ]);

        // Delete old image if exists
        if ($user->profile_image_path) {
            Storage::disk('public')->delete($user->profile_image_path);
        }

        // Store new image
        $path = $data['image']->store('profiles', 'public');
        $user->profile_image_path = $path;
        $user->save();

        return response()->json(['data' => $user->load(['roles:id,name', 'permissions:id,name'])]);
    }

    /**
     * PATCH /api/admin/users/{user}/verify
     * Update user verification status.
     * Body: { "is_verified": true/false }
     */
    public function updateVerification(Request $request, User $user)
    {
        $data = $request->validate([
            'is_verified' => ['required', 'boolean'],
        ]);

        $user->is_verified = $data['is_verified'];
        if ($data['is_verified']) {
            $user->verified_at = now();
        } else {
            $user->verified_at = null;
        }
        $user->save();

        return response()->json(['data' => $user->load(['roles:id,name', 'permissions:id,name'])]);
    }
}
