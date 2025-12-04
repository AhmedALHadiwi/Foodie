<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $payments = Payment::with(['order'])->get();
        return response()->json($payments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|string|max:50',
            'provider_transaction_id' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,completed,failed,refunded',
            'paid_at' => 'nullable|date',
        ]);

        $payment = Payment::create($validated);
        return response()->json($payment, 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['order']);
        return response()->json($payment);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'sometimes|string|max:50',
            'provider_transaction_id' => 'nullable|string|max:255',
            'status' => 'sometimes|string|in:pending,completed,failed,refunded',
            'paid_at' => 'nullable|date',
        ]);

        $payment->update($validated);
        return response()->json($payment);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();
        return response()->json(null, 204);
    }
}
