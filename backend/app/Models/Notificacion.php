<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $fillable = [
        'usuario_id', 'solicitud_id', 'titulo', 'mensaje', 'leida',
    ];
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;
}
