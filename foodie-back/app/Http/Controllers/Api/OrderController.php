<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['user', 'restaurant', 'driver', 'orderItems.dish', 'payment'])->get();
        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'total_amount' => 'required|numeric|min:0',
            'delivery_address' => 'required|string',
            'customer_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:dishes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.special_instructions' => 'nullable|string',
        ]);

        // Generate order data
        $orderData = [
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'user_id' => auth()->id(),
            'restaurant_id' => $validated['restaurant_id'],
            'driver_id' => null,
            'subtotal' => $validated['total_amount'],
            'delivery_fee' => 5.00, // Fixed delivery fee
            'tax' => $validated['total_amount'] * 0.1, // 10% tax
            'total_amount' => $validated['total_amount'] + 5.00 + ($validated['total_amount'] * 0.1),
            'status' => 'preparing', // Start with preparing status
            'placed_at' => now(),
            'estimated_delivery_at' => null, // Will be calculated after items are added
            'delivery_address' => $validated['delivery_address'],
            'payment_id' => null,
            'customer_notes' => $validated['customer_notes'] ?? null,
        ];

        $order = Order::create($orderData);

        // Create order items
        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'dish_id' => $item['menu_item_id'],
                'name_snapshot' => '', // Could fetch dish name if needed
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'notes' => $item['special_instructions'] ?? null,
            ]);
        }

        // Calculate and update status timestamps
        $order->calculateStatusTimestamps();
        $order->save();

        $order->load(['items', 'restaurant', 'user']);

        return response()->json($order, 201);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['user', 'restaurant', 'driver', 'orderItems.dish', 'payment']);

        // Check if status needs updating
        $order->updateStatusWithTimestamp();
        if ($order->isDirty('status')) {
            $order->save();
        }

        return response()->json($order);
    }

    public function restaurant_orders($restaurantId)
    {
        $restaurant = Restaurant::where('id', $restaurantId)
            ->where('owner_id', auth()->id())
            ->firstOrFail();
        $orders = Order::where('restaurant_id', $restaurant->id)
            ->with('user', 'items.dish', 'restaurant')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function customer_orders()
    {
        $user = auth()->user();
        $orders = Order::where('user_id', $user->id)
            ->with('restaurant', 'items.dish')
            ->orderBy('created_at', 'desc')
            ->get();

        // Check and update statuses for all orders
        foreach ($orders as $order) {
            $order->updateStatusWithTimestamp();
            if ($order->isDirty('status')) {
                $order->save();
            }
        }

        return response()->json($orders);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'driver_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|string|in:pending,preparing,on_the_way,delivered,cancelled',
            'estimated_delivery_at' => 'nullable|date',
            'delivery_address' => 'sometimes|string',
            'payment_id' => 'nullable|exists:payments,id',
        ]);

        $order->update($validated);
        return response()->json($order);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        return response()->json(null, 204);
    }
}
