<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RestaurantController extends Controller
{
    public function index(): JsonResponse
    {
        $restaurants = Restaurant::with(['owner', 'categories', 'dishes'])
            ->get()
            ->map(function ($restaurant) {
                return [
                    ...$restaurant->toArray(),
                    'average_rating' => $restaurant->average_rating,
                    'total_reviews' => $restaurant->total_reviews,
                ];
            });
        return response()->json($restaurants);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'owner_id' => 'required|exists:users,id',
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $restaurant = Restaurant::create($validated);
        return response()->json($restaurant, 201);
    }

    public function show(Restaurant $restaurant): JsonResponse
    {
        $restaurant->load(['owner', 'categories', 'dishes', 'reviews']);

        $restaurantData = $restaurant->toArray();
        $restaurantData['average_rating'] = $restaurant->average_rating;
        $restaurantData['total_reviews'] = $restaurant->total_reviews;

        return response()->json($restaurantData);
    }

    public function update(Request $request, Restaurant $restaurant): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $restaurant->update($validated);
        return response()->json($restaurant);
    }

    public function myRestaurant(): JsonResponse
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())
            ->with(['categories', 'dishes'])
            ->first();

        if (!$restaurant) {
            return response()->json(['error' => 'Restaurant not found'], 404);
        }

        $restaurantData = $restaurant->toArray();
        $restaurantData['average_rating'] = $restaurant->average_rating;
        $restaurantData['total_reviews'] = $restaurant->total_reviews;

        return response()->json($restaurantData);
    }

    public function destroy(Restaurant $restaurant): JsonResponse
    {
        $restaurant->delete();
        return response()->json(null, 204);
    }

    public function restaurant_categories($restaurantId): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        $categories = $restaurant->categories()->with('dishes')->get();
        return response()->json($categories);
    }

    public function restaurant_menu_items($restaurantId): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        $menuItems = $restaurant->dishes()->with('category')->get();
        return response()->json($menuItems);
    }

    public function restaurant_categories_for_owner($restaurantId): JsonResponse
    {
        $restaurant = Restaurant::where('id', $restaurantId)
            ->where('owner_id', auth()->id())
            ->firstOrFail();
        $categories = $restaurant->categories()->with('dishes')->get();
        return response()->json($categories);
    }

    public function restaurant_menu_items_for_owner($restaurantId): JsonResponse
    {
        $restaurant = Restaurant::where('id', $restaurantId)
            ->where('owner_id', auth()->id())
            ->firstOrFail();
        $menuItems = $restaurant->dishes()->with('category')->get();
        return response()->json($menuItems);
    }

    public function restaurant_sales($restaurantId, Request $request): JsonResponse
    {
        $restaurant = Restaurant::where('id', $restaurantId)
            ->where('owner_id', auth()->id())
            ->firstOrFail();
        $period = $request->get('period', 'week');

        // Get orders for the restaurant based on period
        $query = $restaurant->orders();

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
                break;
        }

        $orders = $query->with('items')->get();

        // Calculate sales data
        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Group by day for chart data (simplified)
        $salesByDay = $orders->groupBy(function ($order) {
            return $order->created_at->format('Y-m-d');
        })->map(function ($dayOrders) {
            return [
                'date' => $dayOrders->first()->created_at->format('Y-m-d'),
                'revenue' => $dayOrders->sum('total_amount'),
                'orders' => $dayOrders->count()
            ];
        })->values();

        // Calculate top selling items using proper join
        $topItems = \DB::table('order_items')
            ->join('dishes', 'order_items.dish_id', '=', 'dishes.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('dishes.restaurant_id', $restaurantId)
            ->when($period !== 'all', function ($query) use ($period) {
                switch ($period) {
                    case 'today':
                        $query->whereDate('orders.created_at', today());
                        break;
                    case 'week':
                        $query->whereBetween('orders.created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                        break;
                    case 'month':
                        $query->whereMonth('orders.created_at', now()->month)
                            ->whereYear('orders.created_at', now()->year);
                        break;
                }
            })
            ->select(
                'dishes.name',
                \DB::raw('COUNT(order_items.id) as quantity'),
                \DB::raw('SUM(order_items.price * order_items.quantity) as revenue')
            )
            ->groupBy('dishes.id', 'dishes.name')
            ->orderByDesc('quantity')
            ->take(10)
            ->get();

        return response()->json([
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'averageOrderValue' => $averageOrderValue,
            'salesByDay' => $salesByDay,
            'topItems' => $topItems,
            'period' => $period
        ]);
    }
}
