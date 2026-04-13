<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aprobacion extends Model
{
    protected $table = 'aprobaciones';
    protected $fillable = [
        'solicitud_id', 'nivel_id', 'aprobador_id', 'estado', 'comentario', 'fecha_accion',
    ];
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;

    public function solicitud()  { return $this->belongsTo(Solicitud::class, 'solicitud_id'); }
    public function nivel()      { return $this->belongsTo(NivelAprobacion::class, 'nivel_id'); }
    public function aprobador()  { return $this->belongsTo(User::class, 'aprobador_id'); }
}
