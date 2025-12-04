<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\AuthController;

// Auth
Route::middleware(['auth.redirect'])
    ->group(function () {
        Route::controller(AuthController::class)
            ->group(function () {
                Route::post('login', 'login');
                Route::post('register', 'register');
            });
    });

Route::middleware(['auth:sanctum'])
    ->group(function () {

        // User and Profile endpoints (direct routes as React expects)
        Route::controller(AuthController::class)
            ->group(function () {
            Route::get('user', 'user');
            Route::get('profile', 'profile');
            Route::post('profile/update', 'updateProfile');
            Route::post('profile/update-restaurant', 'updateRestaurant');
            Route::post('logout', 'logout');
            Route::post('logout-all', 'logout_all');
            Route::post('change-password', 'change_password');
        });

        Route::get('/restaurants/{restaurantId}/orders', [OrderController::class, 'restaurant_orders']);
        Route::get('/restaurants/{restaurantId}/categories', [RestaurantController::class, 'restaurant_categories']);
        Route::get('/restaurants/{restaurantId}/menu-items', [RestaurantController::class, 'restaurant_menu_items']);
        Route::get('/restaurants/{restaurantId}/sales', [RestaurantController::class, 'restaurant_sales']);
        Route::get('/restaurants/{restaurantId}/reviews', [ReviewController::class, 'restaurantReviews']);
        Route::post('/restaurants/{restaurantId}/reviews', [ReviewController::class, 'store']);
        Route::get('/my-restaurant', [RestaurantController::class, 'myRestaurant']);
        Route::get('/customer/orders', [OrderController::class, 'customer_orders']);

        // API Routes for Foodie App
        Route::apiResource('restaurants', RestaurantController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('dishes', DishController::class);
        Route::apiResource('carts', CartController::class);
        Route::apiResource('orders', OrderController::class);
        Route::apiResource('payments', PaymentController::class);
        Route::apiResource('reviews', ReviewController::class);
        Route::apiResource('notifications', NotificationController::class);

        // Menu items management
        Route::post('menu-items', [DishController::class, 'store']);
        Route::put('menu-items/{dish}', [DishController::class, 'update']);
        Route::delete('menu-items/{dish}', [DishController::class, 'destroy']);

        // Additional notification routes
        Route::patch('notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::patch('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
    });
