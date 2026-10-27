<?php

use App\Exceptions\ReglaNegocioException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
   ->withExceptions(function (Exceptions $exceptions): void {
        // Las rutas de la API siempre responden con JSON.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) =>
                $request->is('api/*') || $request->expectsJson()
        );

        // Las reglas del negocio se responden como HTTP 409.
        $exceptions->render(function (
            ReglaNegocioException $e,
            Request $request
        ) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'mensaje' => $e->getMessage(),
                    'codigo' => 'REGLA_NEGOCIO',
                ], 409);
            }

            return null;
        });

        // Estas excepciones representan reglas del dominio,
        // no errores del sistema, por lo que no se registran.
        $exceptions->dontReport([
            ReglaNegocioException::class,
        ]);
    })
    ->create();
