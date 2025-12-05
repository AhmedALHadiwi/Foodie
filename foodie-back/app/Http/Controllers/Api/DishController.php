<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DishController extends Controller
{
    public function index(): JsonResponse
    {
        $dishes = Dish::with(['restaurant', 'category', 'reviews'])->get();
        return response()->json($dishes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'category_id' => 'required|exists:categories,id',
            'image_url' => 'nullable|string|max:500',
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
            'preparing_time' => 'nullable|integer|min:0',
            'on_the_way_time' => 'nullable|integer|min:0',
        ]);

        $dish = Dish::create($validated);
        return response()->json($dish, 201);
    }

    public function show(Dish $dish): JsonResponse
    {
        $dish->load(['restaurant', 'category', 'reviews']);
        return response()->json($dish);
    }

    public function update(Request $request, Dish $dish): JsonResponse
    {
        $validated = $request->validate([
            'image_url' => 'nullable|string|max:500',
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'is_available' => 'boolean',
            'preparing_time' => 'nullable|integer|min:0',
            'on_the_way_time' => 'nullable|integer|min:0',
        ]);

        $dish->update($validated);
        return response()->json($dish);
    }

    public function destroy(Dish $dish): JsonResponse
    {
        $dish->delete();
        return response()->json(null, 204);
    }
}
