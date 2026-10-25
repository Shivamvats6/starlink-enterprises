<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $clean = fn ($v) => is_string($v) ? trim(strip_tags($v)) : $v;
        $this->merge(collect($this->only(['name', 'company', 'email', 'phone', 'project_type', 'location', 'budget', 'message']))->map($clean)->all());
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'], 'company' => ['nullable', 'string', 'max:160'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['required', 'string', 'max:32', 'regex:/^[0-9+()\-\s]{10,32}$/'],
            'project_type' => ['nullable', 'string', 'max:120'], 'location' => ['nullable', 'string', 'max:160'], 'budget' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'min:10', 'max:1000'],
            'consent' => ['accepted'],
            'website' => ['prohibited'], // honeypot
        ];
    }
}
