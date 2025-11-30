<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\Admin\UserController as UserController;

// PUBLIC read-only endpoints (no auth) — approved only
Route::get('/public/cars',        [CarController::class, 'publicIndex']);
Route::get('/public/cars/{car}',  [CarController::class, 'publicShow']);

// AUTHENTICATED endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected endpoints (auth required)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/me', function(Request $r) {
        $user = $r->user();
        // Load roles and get all permissions (direct + via roles)
        $user->load('roles:id,name,label');
        
        // Get all permissions the user has
        $permissions = [];
        $allPerms = ['cars.view', 'cars.create', 'cars.update', 'cars.delete', 'cars.moderate', 'users.view', 'users.manage'];
        foreach ($allPerms as $perm) {
            if ($user->hasPermission($perm)) {
                $permissions[] = $perm;
            }
        }
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_image_url' => $user->profile_image_url,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'state' => $user->state,
            'postal_code' => $user->postal_code,
            'country' => $user->country,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'company_name' => $user->company_name,
            'is_verified' => $user->is_verified,
            'verified_at' => $user->verified_at,
            'profile_complete_percent' => $user->profile_complete_percent ?? 0,
            'missing_fields' => $user->getMissingProfileFields(),
            'roles' => $user->roles,
            'permissions' => $permissions,
        ]);
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile
    Route::get('/profile',                 [UserController::class, 'profile']);
    Route::put('/profile',                 [UserController::class, 'updateProfile']);
    Route::patch('/profile/password',      [UserController::class, 'changePassword']);
    Route::post('/profile/upload-image',   [AuthController::class, 'uploadProfileImage']);
    Route::delete('/profile/image',        [AuthController::class, 'deleteProfileImage']);

    // Admin user management
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/users',                        [UserController::class, 'index']);
        Route::get('/users-trashed',                [UserController::class, 'indexTrashed']);
        Route::put('/users/{user}',                 [UserController::class, 'update']);
        Route::post('/users/{user}/upload-image',   [UserController::class, 'uploadImage']);
        Route::patch('/users/{user}/roles',         [UserController::class, 'setRoles']);
        Route::patch('/users/{user}/permissions',   [UserController::class, 'setPermissions']);
        Route::patch('/users/{user}/verify',        [UserController::class, 'updateVerification']);
        Route::patch('/users/{user}/restore',       [UserController::class, 'restore'])->withTrashed();
        Route::delete('/users/{user}',              [UserController::class, 'destroy']);
        Route::delete('/users/{user}/force',        [UserController::class, 'force'])->withTrashed();
    });

    // Permission-protected endpoints
    Route::get('/cars',        [CarController::class, 'index'])->middleware('permission:cars.view');
    Route::get('/cars/{car}',     [CarController::class, 'show'])  ->middleware('permission:cars.view');
    Route::post('/cars',       [CarController::class, 'store'])->middleware('permission:cars.create');
    Route::put('/cars/{car}',  [CarController::class, 'update'])->middleware('permission:cars.update');
    Route::delete('/cars/{car}',[CarController::class,'destroy'])->middleware('permission:cars.delete');
    
    // Image upload endpoints
    Route::post('/cars/{car}/upload-image', [CarController::class, 'uploadImage'])->middleware('permission:cars.update');
    Route::delete('/cars/{car}/images/{imageId}', [CarController::class, 'deleteImage'])->middleware('permission:cars.update');
    Route::put('/cars/{car}/images/{imageId}', [CarController::class, 'updateImage'])->middleware('permission:cars.update');

    // Moderation (approve/reject)
    Route::patch('/cars/{car}/approve', [CarController::class, 'approve'])
        ->middleware('permission:cars.moderate');
    Route::patch('/cars/{car}/reject',  [CarController::class, 'reject'])
        ->middleware('permission:cars.moderate');

    // Approved listing
    Route::get('/cars-approved',   [CarController::class, 'indexApproved'])->middleware('permission:cars.view');

    // Rejected listing
    Route::get('/cars-rejected',   [CarController::class, 'indexRejected'])->middleware('permission:cars.view');

    // Trashed listing
    Route::get('/cars-trashed',    [CarController::class, 'indexTrashed'])->middleware('permission:cars.view');

    // Restore & Force delete (bind trashed models)
    Route::patch('/cars/{car}/restore', [CarController::class, 'restore'])
        ->middleware('permission:cars.update')
        ->withTrashed();

    Route::delete('/cars/{car}/force', [CarController::class, 'force'])
        ->middleware('permission:cars.delete')
        ->withTrashed();
});
