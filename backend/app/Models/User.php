<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre', 'email', 'password_hash', 'rol_id', 'departamento', 'activo',
    ];

    protected $hidden = ['password_hash', 'remember_token'];

    protected $casts = ['activo' => 'boolean'];

    // JWT
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return []; }

    // Auth usa password_hash como campo de contraseña
    public function getAuthPassword() { return $this->password_hash; }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}
