<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $data = $r->validate([
            'name'          => ['required', 'string', 'max:150'],
            'email'         => ['required', 'email', Rule::unique('users', 'email')],
            'password'      => ['required', 'string', 'min:6'],
            'role'          => ['sometimes', Rule::in(['buyer', 'seller'])],
            'first_name'    => ['sometimes', 'string', 'max:100'],
            'last_name'     => ['sometimes', 'string', 'max:100'],
            'phone'         => ['sometimes', 'string', 'max:20'],
            'company_name'  => ['sometimes', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'first_name'    => $data['first_name'] ?? null,
            'last_name'     => $data['last_name'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'company_name'  => $data['company_name'] ?? null,
        ]);

        $roleName = $data['role'] ?? 'buyer';
        $role = Role::where('name', $roleName)->firstOrCreate(
            ['name' => $roleName],
            ['id' => (string) Str::uuid(), 'label' => ucfirst($roleName)]
        );

        $user->roles()->syncWithoutDetaching([$role->id]);
        $token = $user->createToken('api')->plainTextToken;
        $user = $user->fresh();

        return response()->json([
            'user'  => $user->load('roles:id,name,label', 'permissions:id,name'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $r)
    {
        $data = $r->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $token = $user->createToken('api')->plainTextToken;
        $user = $user->fresh();

        return response()->json([
            'user'  => $user->load('roles:id,name,label', 'permissions:id,name'),
            'token' => $token,
        ]);
    }

    public function logout(Request $r)
    {
        $r->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logged out']);
    }

    /**
     * POST /api/profile/upload-image
     */
    public function uploadProfileImage(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();
        $file = $request->file('image');
        $filename = 'profiles/' . Str::uuid() . '.' . $file->getClientOriginalExtension();

        $storagePath = Storage::disk('public')->put($filename, file_get_contents($file));

        if (!$storagePath) {
            return response()->json(['message' => 'Failed to upload image.'], 500);
        }

        if ($user->profile_image_path && Storage::disk('public')->exists($user->profile_image_path)) {
            Storage::disk('public')->delete($user->profile_image_path);
        }

        $user->update(['profile_image_path' => $filename]);
        $user->updateProfileComplete();
        $user = $user->fresh();

        return response()->json([
            'message' => 'Profile image uploaded successfully.',
            'user' => $user->load('roles:id,name,label', 'permissions:id,name'),
        ], 200);
    }

    /**
     * DELETE /api/profile/image
     */
    public function deleteProfileImage(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = $request->user();

        if (!$user->profile_image_path) {
            return response()->json(['message' => 'No profile image to delete.'], 404);
        }

        if (Storage::disk('public')->exists($user->profile_image_path)) {
            Storage::disk('public')->delete($user->profile_image_path);
        }

        $user->update(['profile_image_path' => null]);
        $user->updateProfileComplete();
        $user = $user->fresh();

        return response()->json([
            'message' => 'Profile image deleted successfully.',
            'user' => $user->load('roles:id,name,label', 'permissions:id,name'),
        ]);
    }
}
