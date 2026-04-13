<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SolicitudesController;
use App\Http\Controllers\AprobacionesController;
use App\Http\Controllers\NotificacionesController;
use App\Http\Controllers\ReportesController;

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);

// Rutas protegidas con JWT
Route::middleware('auth.jwt')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Solicitudes
    Route::get('/solicitudes',              [SolicitudesController::class, 'listar']);
    Route::post('/solicitudes',             [SolicitudesController::class, 'crear']);
    Route::get('/solicitudes/{id}',         [SolicitudesController::class, 'obtener']);
    Route::get('/solicitudes/{id}/historial', [SolicitudesController::class, 'historial']);

    // Aprobaciones (solo roles aprobadores)
    Route::middleware('rol:jefe,gerente,director_financiero')->group(function () {
        Route::get('/aprobaciones/mis-pendientes', [AprobacionesController::class, 'misPendientes']);
        Route::put('/aprobaciones/{id}',           [AprobacionesController::class, 'actuar']);
    });

    // Notificaciones
    Route::get('/notificaciones',           [NotificacionesController::class, 'listar']);
    Route::put('/notificaciones/{id}/leer', [NotificacionesController::class, 'marcarLeida']);

    // Reportes (solo admin y director)
    Route::middleware('rol:admin,director_financiero')->group(function () {
        Route::get('/reportes/solicitudes',      [ReportesController::class, 'resumenGeneral']);
        Route::get('/reportes/por-departamento', [ReportesController::class, 'porDepartamento']);
    });
});
