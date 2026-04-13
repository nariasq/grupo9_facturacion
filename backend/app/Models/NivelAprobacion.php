<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NivelAprobacion extends Model
{
    protected $table = 'niveles_aprobacion';
    protected $fillable = [
        'nombre', 'orden', 'monto_minimo', 'monto_maximo', 'rol_requerido_id', 'activo',
    ];
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;
}
