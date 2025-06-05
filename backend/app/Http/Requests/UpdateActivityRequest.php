<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Solo el profesor que creó la actividad puede actualizarla
        $activity = $this->route('activity');
        return $this->user() &&
            $this->user()->role === 'profesor' &&
            $activity &&
            $activity->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date|after:now',
            'end_date' => 'sometimes|required|date|after:start_date',
            'max_participants' => 'sometimes|required|integer|min:1|max:100',
            'location' => 'sometimes|nullable|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'is_active' => 'sometimes|boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la actividad es obligatorio.',
            'description.required' => 'La descripción de la actividad es obligatoria.',
            'start_date.required' => 'La fecha de inicio es obligatoria.',
            'start_date.after' => 'La fecha de inicio debe ser posterior a la fecha actual.',
            'end_date.required' => 'La fecha de fin es obligatoria.',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'max_participants.required' => 'El número máximo de participantes es obligatorio.',
            'max_participants.min' => 'Debe haber al menos 1 participante.',
            'max_participants.max' => 'No puede haber más de 100 participantes.',
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no existe.'
        ];
    }
}
