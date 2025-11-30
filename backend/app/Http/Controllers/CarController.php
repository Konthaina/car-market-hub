<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CarController extends Controller
{
    /**
     * GET /api/cars
     * Supports filters + returns images (cover first).
     * Sellers only see their own cars.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);
        $user = $request->user();

        $query = Car::query()
            ->with([
                'images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position'),
                'seller:id,name'
            ])
            // Sellers only see their own cars
            ->when($user->hasRole('seller'), fn($q) => $q->where('seller_id', $user->getKey()))
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = trim((string) $request->string('q'));
                $q->where(function ($w) use ($kw) {
                    $w->where('make', 'like', "%{$kw}%")
                      ->orWhere('model', 'like', "%{$kw}%")
                      ->orWhere('description', 'like', "%{$kw}%");
                });
            })
            ->when($request->filled('make'), fn($q) => $q->where('make', $request->string('make')))
            ->when($request->filled('model'), fn($q) => $q->where('model', $request->string('model')))
            ->when($request->filled('condition'), fn($q) => $q->where('condition', $request->string('condition')))
            ->when($request->filled('location'), fn($q) => $q->where('location', $request->string('location')))
            ->when($request->filled('year_from'), fn($q) => $q->where('year', '>=', (int)$request->year_from))
            ->when($request->filled('year_to'), fn($q) => $q->where('year', '<=', (int)$request->year_to))
            ->when($request->filled('price_min'), fn($q) => $q->where('price', '>=', (float)$request->price_min))
            ->when($request->filled('price_max'), fn($q) => $q->where('price', '<=', (float)$request->price_max))
            ->when($request->filled('mileage_max'), fn($q) => $q->where('mileage', '<=', (int)$request->mileage_max));

        $sort = (string) $request->string('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        $sortable = ['created_at', 'price', 'year', 'mileage'];
        if (!in_array($column, $sortable, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }
        $query->orderBy($column, $direction);

        $paginator = $query->paginate($perPage)->appends($request->query());

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    // GET /api/cars/{car}
    public function show(Request $request, Car $car)
    {
        $user = $request->user();
        
        // Sellers can only view their own cars, but admins can view any car
        if ($user->hasRole('seller') && $car->seller_id !== $user->getKey()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $car->load(['images' => fn($q) => $q
            ->orderByDesc('is_cover')
            ->orderBy('position')
        ]);

        return response()->json(['data' => $car]);
    }

    /**
     * POST /api/cars
     * seller_id is always taken from the authenticated user.
     */
    public function store(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'make'        => ['required', 'string', 'max:100'],
            'model'       => ['required', 'string', 'max:100'],
            'year'        => ['required', 'integer', 'between:1950,' . ((int)date('Y') + 1)],
            'price'       => ['required', 'numeric', 'min:0'],
            'mileage'     => ['nullable', 'integer', 'min:0'],
            'condition'   => ['required', Rule::in(['new', 'used', 'certified'])],
            'location'    => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'images'      => ['sometimes', 'array'],
            'images.*'    => ['nullable'],
            'images.*.alt'      => ['sometimes', 'string', 'max:150'],
            'images.*.is_cover' => ['sometimes', 'boolean'],
            'images.*.position' => ['sometimes', 'integer', 'min:0'],
        ]);

        $validated['seller_id'] = $request->user()->getKey();
        $car = Car::create($validated);

        if ($request->filled('images') && is_array($request->images)) {
            $rows = [];
            foreach (array_values($request->images) as $i => $img) {
                if (is_array($img)) {
                    $rows[] = [
                        'alt'       => $img['alt'] ?? null,
                        'is_cover'  => array_key_exists('is_cover', $img) ? (bool)$img['is_cover'] : ($i === 0),
                        'position'  => array_key_exists('position', $img) ? (int)$img['position'] : $i,
                    ];
                }
            }
            if ($rows) {
                $car->images()->createMany($rows);
            }
        }

        $car->load(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')]);

        return response()->json(['data' => $car], 201);
    }

    /**
     * PUT /api/cars/{car}
     */
    public function update(Request $request, Car $car)
    {
        $user = $request->user();
        
        // Sellers can only edit their own cars, but admins can edit any car
        if ($user->hasRole('seller') && $car->seller_id !== $user->getKey()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'make'        => ['sometimes', 'string', 'max:100'],
            'model'       => ['sometimes', 'string', 'max:100'],
            'year'        => ['sometimes', 'integer', 'between:1950,' . ((int)date('Y') + 1)],
            'price'       => ['sometimes', 'numeric', 'min:0'],
            'mileage'     => ['sometimes', 'integer', 'min:0', 'nullable'],
            'condition'   => ['sometimes', Rule::in(['new','used','certified'])],
            'location'    => ['sometimes', 'string', 'max:150', 'nullable'],
            'description' => ['sometimes', 'string', 'nullable'],
        ]);

        $car->fill($validated)->save();
        $car->load(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')]);

        return response()->json(['data' => $car]);
    }

    /**
     * DELETE /api/cars/{car}
     */
    public function destroy(Request $request, Car $car)
    {
        $user = $request->user();
        
        // Sellers can only delete their own cars, but admins can delete any car
        if ($user->hasRole('seller') && $car->seller_id !== $user->getKey()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $car->delete();
        return response()->json(['message' => 'Car deleted.']);
    }

    /**
     * GET /api/cars-approved
     * List approved cars.
     * Sellers only see their own approved cars, admins see all.
     */
    public function indexApproved(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);
        $user = $request->user();

        $query = Car::approved()
            ->with(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')])
            // Sellers only see their own approved cars
            ->when($user->hasRole('seller'), fn($q) => $q->where('seller_id', $user->getKey()))
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = trim((string) $request->string('q'));
                $q->where(function ($w) use ($kw) {
                    $w->where('make', 'like', "%{$kw}%")
                      ->orWhere('model', 'like', "%{$kw}%")
                      ->orWhere('description', 'like', "%{$kw}%");
                });
            })
            ->orderByDesc('approved_at');

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/cars-rejected
     * List rejected cars.
     * Sellers only see their own rejected cars, admins see all.
     */
    public function indexRejected(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);
        $user = $request->user();

        $query = Car::rejected()
            ->with(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')])
            // Sellers only see their own rejected cars
            ->when($user->hasRole('seller'), fn($q) => $q->where('seller_id', $user->getKey()))
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = trim((string) $request->string('q'));
                $q->where(function ($w) use ($kw) {
                    $w->where('make', 'like', "%{$kw}%")
                      ->orWhere('model', 'like', "%{$kw}%")
                      ->orWhere('description', 'like', "%{$kw}%");
                });
            })
            ->orderByDesc('rejected_at');

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/cars-trashed
     * List soft-deleted cars.
     * Sellers only see their own deleted cars, admins see all.
     */
    public function indexTrashed(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);
        $user = $request->user();

        $query = Car::onlyTrashed()
            ->with(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')])
            // Sellers only see their own deleted cars
            ->when($user->hasRole('seller'), fn($q) => $q->where('seller_id', $user->getKey()))
            ->when($request->filled('q'), function ($q) use ($request) {
                $kw = trim((string) $request->string('q'));
                $q->where(function ($w) use ($kw) {
                    $w->where('make', 'like', "%{$kw}%")
                      ->orWhere('model', 'like', "%{$kw}%")
                      ->orWhere('description', 'like', "%{$kw}%");
                });
            })
            ->orderByDesc('deleted_at');

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * PATCH /api/cars/{car}/restore
     * Uses route binding withTrashed(), so $car can be soft-deleted.
     * Sellers can only restore their own cars, admins can restore any car.
     */
    public function restore(Request $request, Car $car)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Sellers can only restore their own cars
        if ($user->hasRole('seller') && $car->seller_id !== $user->getKey()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$car->trashed()) {
            return response()->json(['message' => 'Car is not deleted.'], 409);
        }

        $car->restore();
        $car->load(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')]);

        return response()->json(['data' => $car]);
    }

    /**
     * DELETE /api/cars/{car}/force
     * Permanently deletes a car. Route uses withTrashed() for binding.
     * Sellers can only force delete their own cars, admins can delete any car.
     */
    public function force(Request $request, Car $car)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Sellers can only force delete their own cars
        if ($user->hasRole('seller') && $car->seller_id !== $user->getKey()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // If CarImage also uses SoftDeletes and you want to purge them too:
        // $car->images()->withTrashed()->forceDelete();

        $car->forceDelete();
        return response()->json(['message' => 'Car permanently deleted.']);
    }


    // GET /api/public/cars
    public function publicIndex(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 15);

        $query = Car::query()
             ->approved()
             ->with([
                 'images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position'),
                 'seller:id,name,email,is_verified'
             ]);

        // (Optional) reuse some filters for public listing:
        if ($request->filled('q')) {
            $kw = trim((string) $request->string('q'));
            $query->where(function ($w) use ($kw) {
                $w->where('make','like',"%{$kw}%")
                ->orWhere('model','like',"%{$kw}%")
                ->orWhere('description','like',"%{$kw}%");
            });
        }

        $query->orderByDesc('published_at')->orderByDesc('created_at');

        $p = $query->paginate($perPage)->appends($request->query());

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

    // GET /api/public/cars/{car}
    public function publicShow(Car $car)
    {
        if (!$car->isApproved()) {
            return response()->json(['message' => 'Not Found.'], 404);
        }
        $car->load(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')]);
        return response()->json(['data' => $car]);
    }


    /**
     * PATCH /api/cars/{car}/approve
     */
    public function approve(Request $request, Car $car)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized. Only admins can approve cars.'], 403);
        }

        if ($car->isApproved()) {
            return response()->json(['message' => 'Already approved.'], 409);
        }

        $car->forceFill([
            'status'      => Car::STATUS_APPROVED,
            'approved_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
            'reviewed_by' => $request->user()->getKey(),
            'published_at' => $car->published_at ?? now(),
        ])->save();

        $car->load(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')]);

        return response()->json(['data' => $car]);
    }

    /**
     * PATCH /api/cars/{car}/reject
     */
    public function reject(Request $request, Car $car)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized. Only admins can reject cars.'], 403);
        }

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $car->forceFill([
            'status'           => Car::STATUS_REJECTED,
            'rejected_at'      => now(),
            'approved_at'      => null,
            'rejection_reason' => $data['reason'],
            'reviewed_by'      => $request->user()->getKey(),
        ])->save();

        $car->load(['images' => fn($q) => $q->orderByDesc('is_cover')->orderBy('position')]);

        return response()->json(['data' => $car]);
    }

    /**
     * POST /api/cars/{car}/upload-image
     */
    public function uploadImage(Request $request, Car $car)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($car->seller_id !== $request->user()->getKey() && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'image'     => ['required', 'image', 'max:5120'],
            'alt'       => ['nullable', 'string', 'max:150'],
            'is_cover'  => ['sometimes', 'boolean'],
        ]);

        $file = $request->file('image');
        $filename = 'cars/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
        $storagePath = Storage::disk('public')->put($filename, file_get_contents($file));

        if (!$storagePath) {
            return response()->json(['message' => 'Failed to upload image.'], 500);
        }

        $image = $car->images()->create([
            'path'      => $filename,
            'alt'       => $validated['alt'] ?? null,
            'is_cover'  => $validated['is_cover'] ?? false,
            'position'  => $car->images()->count(),
        ]);

        return response()->json([
            'data' => [
                'id'       => $image->id,
                'url'      => $image->url,
                'path'     => $image->path,
                'alt'      => $image->alt,
                'is_cover' => $image->is_cover,
                'position' => $image->position,
            ]
        ], 201);
    }

    /**
     * PUT /api/cars/{car}/images/{image}
     */
    public function updateImage(Request $request, Car $car, $imageId)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($car->seller_id !== $request->user()->getKey() && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'alt'       => ['sometimes', 'string', 'max:150'],
            'is_cover'  => ['sometimes', 'boolean'],
            'position'  => ['sometimes', 'integer', 'min:0'],
        ]);

        $image = $car->images()->findOrFail($imageId);
        $image->update($validated);

        return response()->json([
            'data' => [
                'id'       => $image->id,
                'url'      => $image->url,
                'path'     => $image->path,
                'alt'      => $image->alt,
                'is_cover' => $image->is_cover,
                'position' => $image->position,
            ]
        ]);
    }

    /**
     * DELETE /api/cars/{car}/images/{image}
     */
    public function deleteImage(Request $request, Car $car, $imageId)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($car->seller_id !== $request->user()->getKey() && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $image = $car->images()->findOrFail($imageId);
        $image->delete();

        return response()->json(['message' => 'Image deleted.']);
    }
}
