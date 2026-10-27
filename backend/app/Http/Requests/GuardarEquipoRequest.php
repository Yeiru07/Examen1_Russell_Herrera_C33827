<?php

namespace App\Http\Requests;

use App\Models\Equipo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Equipo|null $equipo */
        $equipo = $this->route('equipo');

        return [
            'codigo' => [
                'required',
                'string',
                'max:20',
                'regex:/^EQ-\d{4}$/',
                Rule::unique('equipos', 'codigo')->ignore($equipo?->id),
            ],

            'nombre' => ['required', 'string', 'min:3', 'max:120'],
            'categoria_id' => [
                'required',
                'integer',
                'exists:categorias,id',
            ],
            'estado' => [
                'sometimes',
                'required',
                Rule::in(['disponible', 'mantenimiento']),
            ],
            'fecha_adquisicion' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'costo_interno' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'El codigo es obligatorio.',
            'codigo.string' => 'El codigo debe tener formato en texto.',
            'codigo.max' => 'El codigo no puede superar los 20 caracteres.',
            'codigo.regex' => 'El codigo debe tener el siguiente formato: EQ-0000.',
            'codigo.unique' => 'Este codigo ya se encuentra en uso.',

            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe tener forma texto.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'nombre.max' => 'El nombre no puede superar los 120 caracteres.',

            'categoria_id.required' => 'La categoria es obligatoria.',
            'categoria_id.integer' => 'La categoria debe ser un numero entero.',
            'categoria_id.exists' => 'La categoria seleccionada no existe.',

            'estado.required' => 'El estado no puede estar vacio.',
            'estado.in' => 'El estado debe ser: disponible o mantenimiento.',

            'fecha_adquisicion.required' => 'La fecha de adquisicion es obligatoria.',
            'fecha_adquisicion.date' => 'La fecha de adquisicion es invalida.',
            'fecha_adquisicion.before_or_equal' => 'La fecha de adquisicion no puede ser futura.',

            'costo_interno.required' => 'El costo interno es obligatorio.',
            'costo_interno.numeric' => 'El costo interno debe ser numérico.',
            'costo_interno.min' => 'El costo interno debe ser mayor o igual a cero.',
        ];
    }
}
