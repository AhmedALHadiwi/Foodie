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

    public function simulatePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|string|in:credit_card,wallet,bank_transfer',
            'card_number' => 'nullable|string|max:16',
            'amount' => 'required|numeric|min:0',
        ]);

        $order = \App\Models\Order::find($validated['order_id']);

        // Simulate payment processing
        $isSuccessful = $this->processMockPayment($validated['payment_method'], $validated['card_number'] ?? null);

        $payment = Payment::create([
            'order_id' => $validated['order_id'],
            'amount' => $validated['amount'],
            'method' => $validated['payment_method'],
            'provider_transaction_id' => 'SIM_' . uniqid() . '_' . time(),
            'status' => $isSuccessful ? 'completed' : 'failed',
            'paid_at' => $isSuccessful ? now() : null,
        ]);

        // Update order status if payment successful
        if ($isSuccessful) {
            $order->update(['status' => 'paid']);
        }

        return response()->json([
            'success' => $isSuccessful,
            'payment' => $payment,
            'message' => $isSuccessful ? 'Payment processed successfully' : 'Payment failed'
        ]);
    }

    public function processMockPayment(string $method, ?string $cardNumber = null): bool
    {
        // Simulate different success rates based on payment method
        $successRates = [
            'credit_card' => 0.85, // 85% success rate
            'wallet' => 0.95,      // 95% success rate
            'bank_transfer' => 0.90 // 90% success rate
        ];

        $successRate = $successRates[$method] ?? 0.5;

        // Simulate card validation for credit cards
        if ($method === 'credit_card' && $cardNumber) {
            // Simple validation: cards ending with even numbers have higher success rate
            if ((int) substr($cardNumber, -1) % 2 === 0) {
                $successRate = 0.95;
            } else {
                $successRate = 0.70;
            }
        }

        return (mt_rand() / mt_getrandmax()) < $successRate;
    }

    public function getPaymentMethods(): JsonResponse
    {
        return response()->json([
            [
                'id' => 'credit_card',
                'name' => 'Credit Card',
                'description' => 'Pay with Visa/MasterCard',
                'icon' => 'credit-card'
            ],
            [
                'id' => 'wallet',
                'name' => 'Mobile Wallet',
                'description' => 'Vodafone Cash, Etisalat Cash, Orange Cash',
                'icon' => 'wallet'
            ],
            [
                'id' => 'bank_transfer',
                'name' => 'Bank Transfer',
                'description' => 'Direct bank transfer',
                'icon' => 'bank'
            ]
        ]);
    }
}
