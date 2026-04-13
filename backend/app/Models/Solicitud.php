<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Solicitud extends Model
{
    protected $table = 'solicitudes';
    protected $fillable = [
        'titulo', 'descripcion', 'monto', 'tipo', 'estado',
        'solicitante_id', 'nivel_actual', 'orden_compra_generada',
    ];

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function aprobaciones()
    {
        return $this->hasMany(Aprobacion::class, 'solicitud_id');
    }
}
