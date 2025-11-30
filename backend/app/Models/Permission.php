<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Permission extends Model
{
    use HasUuids;

    protected $table = 'permissions';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'label'];

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    // Optional: direct user-permission grants
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
