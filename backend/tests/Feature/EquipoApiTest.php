<?php

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/*
| TODO [B6] Escriba las tres pruebas. Cada una debe verificar el código
| de estado Y algo más (estructura, encabezado, mensaje o estado de la base).
|
| Quite el ->todo() de cada prueba al implementarla.
| Ejecute:  php artisan test --filter=EquipoApi
*/


beforeEach(function () {
    $this->seed();
    Sanctum::actingAs(User::factory()->create());
});

it('crea un equipo y responde 201 con el encabezado Location', function () {
    $categoria = Categoria::query()->firstOrFail();

    $datos = [
        'codigo' => 'EQ-9876',
        'nombre' => 'Laptop de prueba',
        'categoria_id' => $categoria->id,
        'estado' => 'disponible',
        'fecha_adquisicion' => '2026-09-15',
        'costo_interno' => 250000,
    ];

    $response = $this->postJson('/api/equipos', $datos);

    $response->assertCreated()
        ->assertHeader('Location')
        ->assertJsonPath('data.codigo', 'EQ-9876')
        ->assertJsonMissingPath('data.costo_interno');

    $this->assertDatabaseHas('equipos', [
        'codigo' => 'EQ-9876',
        'nombre' => 'Laptop de prueba',
    ]);
});

it('rechaza un equipo con datos inválidos y responde 422 con errores por campo', function () {
    $response = $this->postJson('/api/equipos', [
        'codigo' => 'INVALIDO',
        'nombre' => 'A',
        'categoria_id' => 999999,
        'estado' => 'prestado',
        'fecha_adquisicion' => '2030-01-01',
        'costo_interno' => -1,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors([
            'codigo',
            'nombre',
            'categoria_id',
            'estado',
            'fecha_adquisicion',
            'costo_interno',
        ]);
});

it('impide eliminar un equipo prestado y responde 409', function () {
    $categoria = Categoria::query()->firstOrFail();

    $equipo = Equipo::factory()->create([
        'categoria_id' => $categoria->id,
        'estado' => 'prestado',
    ]);

    $response = $this->deleteJson("/api/equipos/{$equipo->id}");

    $response->assertStatus(409);

    $this->assertDatabaseHas('equipos', [
        'id' => $equipo->id,
        'estado' => 'prestado',
    ]);
});
