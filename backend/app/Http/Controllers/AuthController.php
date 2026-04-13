<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('rol')->where('email', $request->email)->first();

        if (!$user || !$user->activo) {
            return response()->json(['error' => 'Credenciales incorrectas.'], 401);
        }

        if (!password_verify($request->password, $user->password_hash)) {
            return response()->json(['error' => 'Credenciales incorrectas.'], 401);
        }

        $payload = [
            'id'          => $user->id,
            'nombre'      => $user->nombre,
            'email'       => $user->email,
            'rol'         => $user->rol->nombre,
            'departamento'=> $user->departamento,
        ];

        $token = JWTAuth::claims($payload)->fromUser($user);

        return response()->json([
            'mensaje' => 'Login exitoso',
            'token'   => $token,
            'usuario' => $payload,
        ]);
    }

    public function me(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $user->load('rol');

        return response()->json([
            'id'          => $user->id,
            'nombre'      => $user->nombre,
            'email'       => $user->email,
            'departamento'=> $user->departamento,
            'rol'         => $user->rol->nombre,
            'creado_en'   => $user->creado_en,
        ]);
    }
}
