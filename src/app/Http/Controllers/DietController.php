<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\DietRequest;

class DietController extends Controller
{
    

    public function create(Request $request)
    {
        return Inertia::render('Diet/CreateDiet'); 
    }

    public function store(DietRequest $request)
    {
        return var_dump($request->all());
    }
}
