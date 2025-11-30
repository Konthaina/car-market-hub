<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $ok = $user->roles()->whereIn('name', $roles)->exists();

        if (!$ok) {
            return response()->json(['message' => 'Forbidden. Requires role: '.implode(',', $roles)], 403);
        }

        return $next($request);
    }
}
