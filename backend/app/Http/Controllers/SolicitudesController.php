<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Solicitud;
use App\Models\NivelAprobacion;
use App\Models\Aprobacion;
use App\Models\Notificacion;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class SolicitudesController extends Controller
{
    private function usuario()
    {
        return JWTAuth::parseToken()->authenticate();
    }

    public function listar()
    {
        $user = $this->usuario();
        $solicitudes = Solicitud::with('solicitante')
            ->where('solicitante_id', $user->id)
            ->orderBy('creado_en', 'desc')
            ->get()
            ->map(fn($s) => array_merge($s->toArray(), [
                'solicitante' => $s->solicitante->nombre,
            ]));

        return response()->json($solicitudes);
    }

    public function obtener($id)
    {
        $solicitud = Solicitud::with('solicitante')->findOrFail($id);
        $data = $solicitud->toArray();
        $data['solicitante'] = $solicitud->solicitante->nombre;
        $data['email_solicitante'] = $solicitud->solicitante->email;
        return response()->json($data);
    }

    public function historial($id)
    {
        $rows = DB::select(
            "SELECT a.id, a.estado, a.comentario, a.fecha_accion, a.creado_en,
                    n.nombre AS nivel, n.orden,
                    u.nombre AS aprobador, u.email AS email_aprobador
             FROM aprobaciones a
             JOIN niveles_aprobacion n ON a.nivel_id = n.id
             LEFT JOIN usuarios u ON a.aprobador_id = u.id
             WHERE a.solicitud_id = ?
             ORDER BY n.orden ASC",
            [$id]
        );
        return response()->json($rows);
    }

    public function crear(Request $request)
    {
        $request->validate([
            'titulo'      => 'required|string',
            'descripcion' => 'required|string',
            'monto'       => 'required|numeric|min:1',
            'tipo'        => 'in:compra,gasto',
        ]);

        $user = $this->usuario();

        DB::beginTransaction();
        try {
            $solicitud = Solicitud::create([
                'titulo'        => $request->titulo,
                'descripcion'   => $request->descripcion,
                'monto'         => $request->monto,
                'tipo'          => $request->tipo ?? 'compra',
                'estado'        => 'en_revision',
                'solicitante_id'=> $user->id,
                'nivel_actual'  => 1,
            ]);

            $niveles = NivelAprobacion::where('activo', true)
                ->where('monto_minimo', '<=', $request->monto)
                ->where(function ($q) use ($request) {
                    $q->whereNull('monto_maximo')
                      ->orWhere('monto_maximo', '>=', $request->monto);
                })
                ->orderBy('orden')
                ->get();

            if ($niveles->isEmpty()) {
                DB::rollBack();
                return response()->json(['error' => 'No hay niveles de aprobación configurados para este monto.'], 400);
            }

            foreach ($niveles as $nivel) {
                Aprobacion::create([
                    'solicitud_id' => $solicitud->id,
                    'nivel_id'     => $nivel->id,
                    'estado'       => 'pendiente',
                ]);
            }

            // Notificar al primer aprobador
            $primerNivel = $niveles->first();
            $aprobadores = User::whereHas('rol', fn($q) => $q->where('id', $primerNivel->rol_requerido_id))->get();
            foreach ($aprobadores as $aprobador) {
                Notificacion::create([
                    'usuario_id'   => $aprobador->id,
                    'solicitud_id' => $solicitud->id,
                    'titulo'       => 'Nueva solicitud pendiente de aprobación',
                    'mensaje'      => "La solicitud \"{$request->titulo}\" por \${$request->monto} está pendiente de tu aprobación.",
                ]);
            }

            DB::commit();
            return response()->json([
                'mensaje'          => 'Solicitud creada exitosamente.',
                'solicitud'        => $solicitud,
                'niveles_asignados'=> $niveles->count(),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error interno del servidor.'], 500);
        }
    }
}
