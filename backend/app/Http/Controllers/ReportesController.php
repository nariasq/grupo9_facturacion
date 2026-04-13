<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class ReportesController extends Controller
{
    public function resumenGeneral()
    {
        $row = DB::selectOne(
            "SELECT
               COUNT(*) FILTER (WHERE estado = 'en_revision') AS en_revision,
               COUNT(*) FILTER (WHERE estado = 'aprobada')   AS aprobadas,
               COUNT(*) FILTER (WHERE estado = 'rechazada')  AS rechazadas,
               COUNT(*) FILTER (WHERE estado = 'borrador')   AS borradores,
               COUNT(*)                                       AS total,
               SUM(monto) FILTER (WHERE estado = 'aprobada') AS monto_total_aprobado,
               AVG(monto)                                     AS monto_promedio
             FROM solicitudes"
        );
        return response()->json($row);
    }

    public function porDepartamento()
    {
        $rows = DB::select(
            "SELECT
               u.departamento,
               COUNT(s.id) AS total_solicitudes,
               SUM(s.monto) AS monto_total,
               COUNT(*) FILTER (WHERE s.estado = 'aprobada')  AS aprobadas,
               COUNT(*) FILTER (WHERE s.estado = 'rechazada') AS rechazadas
             FROM solicitudes s
             JOIN usuarios u ON s.solicitante_id = u.id
             GROUP BY u.departamento
             ORDER BY monto_total DESC"
        );
        return response()->json($rows);
    }
}
