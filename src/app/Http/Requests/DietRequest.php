<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DietRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'max_calories' => 'required|numeric|min:0',
            'min_calories' => 'required|numeric|min:0|lte:max_calories',
            'protein_max' => 'required|numeric|min:0|max:100',
            'fat_max' => 'required|numeric|min:0|max:100',
            'carb_max' => 'required|numeric|min:0|max:100',
            'dietWindows' => 'required|array',
            'dietWindows.*.id' => 'required|integer',
            'dietWindows.*.start_time' => 'required|date_format:H:i',
            'dietWindows.*.end_time' => 'required|date_format:H:i|after_or_equal:dietWindows.*.start_time',
            'dietWindows.*.day' => 'nullable|integer|min:1|max:7',
        ];   
    }
}
