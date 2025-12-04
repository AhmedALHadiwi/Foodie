<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = Review::with(['user', 'restaurant', 'dish'])->get();
        return response()->json($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Check if user is a customer
        if ($user->role !== 'customer') {
            return response()->json(['error' => 'Only customers can create reviews'], 403);
        }

        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'dish_id' => 'nullable|exists:dishes,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        // Check if user already reviewed this restaurant
        $existingReview = Review::where('user_id', $user->id)
            ->where('restaurant_id', $validated['restaurant_id'])
            ->first();

        if ($existingReview) {
            return response()->json(['error' => 'You have already reviewed this restaurant'], 422);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'restaurant_id' => $validated['restaurant_id'],
            'dish_id' => $validated['dish_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_visible' => true,
        ]);

        $review->load(['user', 'restaurant', 'dish']);
        return response()->json($review, 201);
    }

    public function show(Review $review): JsonResponse
    {
        $review->load(['user', 'restaurant', 'dish']);
        return response()->json($review);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $user = Auth::user();

        // Check if user owns this review
        if ($review->user_id !== $user->id) {
            return response()->json(['error' => 'You can only edit your own reviews'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);
        $review->load(['user', 'restaurant', 'dish']);
        return response()->json($review);
    }

    public function destroy(Review $review): JsonResponse
    {
        $user = Auth::user();

        // Check if user owns this review
        if ($review->user_id !== $user->id) {
            return response()->json(['error' => 'You can only delete your own reviews'], 403);
        }

        $review->delete();
        return response()->json(null, 204);
    }

    // Get reviews for a specific restaurant
    public function restaurantReviews(Restaurant $restaurant): JsonResponse
    {
        $reviews = $restaurant->reviews()
            ->with(['user'])
            ->where('is_visible', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'customer_name' => $review->user->full_name,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json($reviews);
    }
}
