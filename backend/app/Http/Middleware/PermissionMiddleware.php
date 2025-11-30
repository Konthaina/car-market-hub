<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // direct or via roles
        $has = $user->permissions()->where('name', $permission)->exists()
            || $user->roles()->whereHas('permissions', fn($q) => $q->where('name', $permission))->exists();

        if (!$has) {
            return response()->json(['message' => 'Forbidden. Missing permission: '.$permission], 403);
        }

        return $next($request);
    }
}
