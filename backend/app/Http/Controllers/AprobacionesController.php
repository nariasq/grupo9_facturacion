<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Aprobacion;
use App\Models\Solicitud;
use App\Models\Notificacion;
use Tymon\JWTAuth\Facades\JWTAuth;

class AprobacionesController extends Controller
{
    private function usuario()
    {
        return JWTAuth::parseToken()->authenticate();
    }

    public function misPendientes()
    {
        $user = $this->usuario();
        $user->load('rol');
        $rolNombre = $user->rol->nombre;

        $rows = DB::select(
            "SELECT a.id AS aprobacion_id, a.estado AS estado_aprobacion,
                    s.id AS solicitud_id, s.titulo, s.descripcion, s.monto, s.tipo,
                    s.creado_en AS fecha_solicitud,
                    n.nombre AS nivel, n.orden,
                    u.nombre AS solicitante, u.email AS email_solicitante, u.departamento
             FROM aprobaciones a
             JOIN solicitudes s ON a.solicitud_id = s.id
             JOIN niveles_aprobacion n ON a.nivel_id = n.id
             JOIN usuarios u ON s.solicitante_id = u.id
             JOIN roles r ON r.id = n.rol_requerido_id
             WHERE a.estado = 'pendiente'
               AND r.nombre = ?
               AND n.orden = s.nivel_actual
               AND s.estado = 'en_revision'
             ORDER BY s.creado_en ASC",
            [$rolNombre]
        );

        return response()->json($rows);
    }

    public function actuar(Request $request, $id)
    {
        $request->validate([
            'accion'     => 'required|in:aprobar,rechazar',
            'comentario' => 'nullable|string',
        ]);

        $user = $this->usuario();

        DB::beginTransaction();
        try {
            $aprobacion = Aprobacion::with(['solicitud', 'nivel'])
                ->where('id', $id)
                ->where('estado', 'pendiente')
                ->firstOrFail();

            $solicitud   = $aprobacion->solicitud;
            $ordenNivel  = $aprobacion->nivel->orden;
            $nuevoEstado = $request->accion === 'aprobar' ? 'aprobada' : 'rechazada';

            $aprobacion->update([
                'estado'       => $nuevoEstado,
                'aprobador_id' => $user->id,
                'comentario'   => $request->comentario,
                'fecha_accion' => now(),
            ]);

            if ($request->accion === 'rechazar') {
                $solicitud->update(['estado' => 'rechazada']);
                $mensaje = "Tu solicitud \"{$solicitud->titulo}\" fue RECHAZADA en el nivel {$ordenNivel}. Comentario: " . ($request->comentario ?? 'Sin comentario.');
                $estadoSolicitud = 'rechazada';
            } else {
                $siguiente = Aprobacion::join('niveles_aprobacion', 'aprobaciones.nivel_id', '=', 'niveles_aprobacion.id')
                    ->where('aprobaciones.solicitud_id', $solicitud->id)
                    ->where('aprobaciones.estado', 'pendiente')
                    ->orderBy('niveles_aprobacion.orden')
                    ->first();

                if ($siguiente) {
                    $solicitud->update(['nivel_actual' => $siguiente->orden]);
                    $mensaje = "Tu solicitud \"{$solicitud->titulo}\" fue aprobada en el nivel {$ordenNivel} y avanzó al siguiente nivel.";
                    $estadoSolicitud = 'en_revision';
                } else {
                    $solicitud->update(['estado' => 'aprobada', 'orden_compra_generada' => true]);
                    $mensaje = "Tu solicitud \"{$solicitud->titulo}\" fue APROBADA en todos los niveles.";
                    $estadoSolicitud = 'aprobada';
                }
            }

            Notificacion::create([
                'usuario_id'   => $solicitud->solicitante_id,
                'solicitud_id' => $solicitud->id,
                'titulo'       => 'Actualización de tu solicitud',
                'mensaje'      => $mensaje,
            ]);

            DB::commit();
            return response()->json([
                'mensaje'          => $request->accion === 'aprobar' ? 'Solicitud aprobada.' : 'Solicitud rechazada.',
                'estado_solicitud' => $estadoSolicitud,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error interno del servidor.'], 500);
        }
    }
}
