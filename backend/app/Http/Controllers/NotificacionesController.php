<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notificacion;
use Tymon\JWTAuth\Facades\JWTAuth;

class NotificacionesController extends Controller
{
    private function usuario()
    {
        return JWTAuth::parseToken()->authenticate();
    }

    public function listar()
    {
        $user = $this->usuario();
        $notificaciones = Notificacion::where('usuario_id', $user->id)
            ->orderBy('creado_en', 'desc')
            ->limit(50)
            ->get(['id', 'titulo', 'mensaje', 'leida', 'solicitud_id', 'creado_en']);

        return response()->json($notificaciones);
    }

    public function marcarLeida($id)
    {
        $user = $this->usuario();
        Notificacion::where('id', $id)->where('usuario_id', $user->id)->update(['leida' => true]);
        return response()->json(['mensaje' => 'Notificación marcada como leída.']);
    }
}
