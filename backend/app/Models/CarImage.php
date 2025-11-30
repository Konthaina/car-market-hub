<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CarImage extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['car_id','path','alt','is_cover','position'];

    protected $casts = [
        'is_cover' => 'boolean',
        'position' => 'integer',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        if ($this->path) {
            return asset('storage/' . $this->path);
        }
        return null;
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}
