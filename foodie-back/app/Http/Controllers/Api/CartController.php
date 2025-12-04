<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function index(): JsonResponse
    {
        $carts = Cart::with(['user', 'cartItems.dish'])->get();
        return response()->json($carts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|in:active,ordered,abandoned',
        ]);

        $cart = Cart::create($validated);
        return response()->json($cart, 201);
    }

    public function show(Cart $cart): JsonResponse
    {
        $cart->load(['user', 'cartItems.dish']);
        return response()->json($cart);
    }

    public function update(Request $request, Cart $cart): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:active,ordered,abandoned',
        ]);

        $cart->update($validated);
        return response()->json($cart);
    }

    public function destroy(Cart $cart): JsonResponse
    {
        $cart->delete();
        return response()->json(null, 204);
    }
}
