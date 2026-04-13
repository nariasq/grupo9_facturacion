<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class VerificarRol
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $user->load('rol');
            if (!in_array($user->rol->nombre, $roles)) {
                return response()->json(['error' => 'Acceso denegado.'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'No autenticado.'], 401);
        }

        return $next($request);
    }
}
