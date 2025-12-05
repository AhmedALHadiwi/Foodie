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

        // Debug logging
        \Log::info('Review submission attempt', [
            'user_id' => $user?->id,
            'user_role' => $user?->role,
            'authenticated' => Auth::check(),
        ]);

        // Check if user is authenticated
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Check if user is a customer (not a restaurant owner)
        if ($user->role === 'owner') {
            return response()->json(['error' => 'Restaurant owners cannot create reviews', 'user_role' => $user->role], 403);
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

        // Get dish_id - either provided or first dish from restaurant
        $dishId = $validated['dish_id'] ?? null;
        if (empty($dishId)) {
            $firstDish = \App\Models\Dish::where('restaurant_id', $validated['restaurant_id'])->first();
            if (!$firstDish) {
                return response()->json(['error' => 'Cannot create review: restaurant has no dishes'], 422);
            }
            $dishId = $firstDish->id;
        }

        $review = Review::create([
            'user_id' => $user->id,
            'restaurant_id' => $validated['restaurant_id'],
            'dish_id' => $dishId,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_visible' => true,
        ]);

        $review->load(['user', 'restaurant', 'dish']);
        return response()->json($review, 201);
    }

    public function userReview($restaurantId): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['hasReviewed' => false]);
        }

        $review = Review::where('user_id', $user->id)
            ->where('restaurant_id', $restaurantId)
            ->first();

        return response()->json([
            'hasReviewed' => $review !== null,
            'review' => $review
        ]);
    }

    public function restaurantReviews($restaurantId): JsonResponse
    {
        $reviews = Review::where('restaurant_id', $restaurantId)
            ->with(['user', 'dish'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
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
}
