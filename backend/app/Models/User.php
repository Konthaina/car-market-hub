<?php

namespace App\Models;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_image_path',
        'phone',
        'first_name',
        'last_name',
        'bio',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'date_of_birth',
        'gender',
        'company_name',
        'is_verified',
        'verified_at',
        'profile_complete_percent',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_verified' => 'boolean',
        'password' => 'hashed', // Laravel 10+ auto-hashing cast
        'profile_complete_percent' => 'integer',
    ];

    protected $appends = ['profile_image_url'];

    public function getProfileImageUrlAttribute()
    {
        if ($this->profile_image_path) {
            return asset('storage/' . $this->profile_image_path);
        }
        return null;
    }

    public function calculateProfileComplete(): int
    {
        $fields = [
            'name',
            'email',
            'first_name',
            'last_name',
            'phone',
            'bio',
            'address',
            'city',
            'state',
            'postal_code',
            'country',
            'date_of_birth',
            'gender',
            'company_name',
            'profile_image_path',
        ];

        $filledCount = 0;
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $filledCount++;
            }
        }

        return intval(($filledCount / count($fields)) * 100);
    }

    public function updateProfileComplete(): void
    {
        $newCompletion = $this->calculateProfileComplete();
        $updateData = ['profile_complete_percent' => $newCompletion];

        // Auto-unverify if profile drops below 90% completion
        if ($newCompletion < 90 && $this->is_verified) {
            $updateData['is_verified'] = false;
            $updateData['verified_at'] = null;
        }

        $this->update($updateData);
    }

    public function getMissingProfileFields(): array
    {
        $fields = [
            'name' => 'Username',
            'email' => 'Email',
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'phone' => 'Phone',
            'bio' => 'Bio',
            'address' => 'Address',
            'city' => 'City',
            'state' => 'State',
            'postal_code' => 'Postal Code',
            'country' => 'Country',
            'date_of_birth' => 'Date of Birth',
            'gender' => 'Gender',
            'company_name' => 'Company Name',
            'profile_image_path' => 'Profile Picture',
        ];

        $missing = [];
        foreach ($fields as $field => $label) {
            if (empty($this->$field)) {
                $missing[$field] = $label;
            }
        }

        return $missing;
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = (array) $roles;
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->permissions()->where('name', $permission)->exists()) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', fn($q) => $q->where('name', $permission))
            ->exists();
    }

    public function authorizeRoles(string|array $roles): void
    {
        abort_unless($this->hasRole($roles), 403, 'Insufficient role.');
    }

    public function authorizePermission(string $permission): void
    {
        abort_unless($this->hasPermission($permission), 403, 'Insufficient permission.');
    }

    public function giveRole(Role|string $role): void
    {
        $roleId = $role instanceof Role ? $role->id : Role::where('name', $role)->value('id');
        if ($roleId) {
            $this->roles()->syncWithoutDetaching([$roleId]);
        }
    }

    public function revokeRole(Role|string $role): void
    {
        $roleId = $role instanceof Role ? $role->id : Role::where('name', $role)->value('id');
        if ($roleId) {
            $this->roles()->detach($roleId);
        }
    }

    public function grantPermission(Permission|string $permission): void
    {
        $permId = $permission instanceof Permission ? $permission->id : Permission::where('name', $permission)->value('id');
        if ($permId) {
            $this->permissions()->syncWithoutDetaching([$permId]);
        }
    }

    public function revokePermission(Permission|string $permission): void
    {
        $permId = $permission instanceof Permission ? $permission->id : Permission::where('name', $permission)->value('id');
        if ($permId) {
            $this->permissions()->detach($permId);
        }
    }
}
