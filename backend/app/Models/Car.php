<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class Car extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'seller_id',
        'make',
        'model',
        'year',
        'price',
        'mileage',
        'condition',
        'location',
        'description',
    ];

    protected $casts = [
        'year'         => 'integer',
        'price'        => 'decimal:2',
        'mileage'      => 'integer',
        'approved_at'  => 'datetime',
        'rejected_at'  => 'datetime',
        'published_at' => 'datetime',
    ];

    protected $attributes = [
        'condition' => 'used',
        'status'    => self::STATUS_PENDING,
    ];

    protected static function booted(): void
    {
        static::creating(function (Car $car) {
            if (empty($car->id)) {
                $car->id = (string) Str::uuid();
            }
            if (empty($car->status)) {
                $car->status = self::STATUS_PENDING;
            }
        });
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function images()
    {
        return $this->hasMany(CarImage::class);
    }

    public function scopeKeyword($query, ?string $kw)
    {
        if (!filled($kw)) return $query;
        $kw = trim($kw);
        return $query->where(function ($w) use ($kw) {
            $w->where('make', 'like', "%{$kw}%")
              ->orWhere('model', 'like', "%{$kw}%")
              ->orWhere('description', 'like', "%{$kw}%");
        });
    }

    public function scopePriceBetween($query, $min = null, $max = null)
    {
        if ($min !== null) $query->where('price', '>=', (float) $min);
        if ($max !== null) $query->where('price', '<=', (float) $max);
        return $query;
    }

    public function scopeYearBetween($query, $from = null, $to = null)
    {
        if ($from !== null) $query->where('year', '>=', (int) $from);
        if ($to   !== null) $query->where('year', '<=', (int) $to);
        return $query;
    }

    public function scopeMileageMax($query, $max = null)
    {
        if ($max !== null) $query->where('mileage', '<=', (int) $max);
        return $query;
    }

    public function scopeApproved($q)
    {
        return $q->where('status', self::STATUS_APPROVED);
    }

    public function scopePending($q)
    {
        return $q->where('status', self::STATUS_PENDING);
    }

    public function scopeRejected($q)
    {
        return $q->where('status', self::STATUS_REJECTED);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}
