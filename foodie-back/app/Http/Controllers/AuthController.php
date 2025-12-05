<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{

    function login(LoginRequest $request)
    {
        $login_data = $request->validated();

        if (Auth::attempt($login_data)) {

            // $user = User::where('email', $login_data['email'])->first();

            /**
             * @var \App\Models\User $user
             */

            $user = Auth::user();



            $token = $user->createToken('desktop-login', [$user->role], now()->addHours(30))->plainTextToken;


            return $this->http_response(['user' => $user, 'token' => $token, 'redirect_to' => '/restaurants'], 200);


        }

        return $this->http_response(["error_message" => 'Your credintinals is not matching our records'], 401);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'is_restaurant_owner' => 'sometimes|boolean',
            // Restaurant fields (only required if owner)
            'restaurant_name' => 'required_if:is_restaurant_owner,1|string|max:255',
            'restaurant_phone' => 'required_if:is_restaurant_owner,1|string|max:20',
            'restaurant_address' => 'required_if:is_restaurant_owner,1|string',
            'restaurant_logo' => 'nullable_if:is_restaurant_owner,1|image|mimes:jpeg,png,jpg,gif|max:2048',
            'restaurant_logo_url' => 'nullable_if:is_restaurant_owner,1|url|max:500'
        ]);

        // Set default value for is_restaurant_owner if not provided
        $isRestaurantOwner = $validated['is_restaurant_owner'] ?? false;

        // Create user
        $userData = [
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => $isRestaurantOwner ? 'owner' : 'customer',
        ];

        $user = User::create($userData);

        // Create restaurant if user is owner
        $restaurant = null;
        if ($isRestaurantOwner) {
            $logoPath = null;
            $logoUrl = null;

            if ($request->hasFile('restaurant_logo')) {
                $logoPath = $request->file('restaurant_logo')->store('restaurants', 'public');
            } elseif (!empty($validated['restaurant_logo_url'])) {
                $logoUrl = $validated['restaurant_logo_url'];
            }

            $restaurant = Restaurant::create([
                'owner_id' => $user->id,
                'name' => $validated['restaurant_name'],
                'phone' => $validated['restaurant_phone'],
                'address' => $validated['restaurant_address'],
                'logo_path' => $logoPath,
                'logo_url' => $logoUrl,
                'is_active' => true,
            ]);
        }

        if ($user) {
            $token = $user->createToken('auth_token')->plainTextToken;

            return $this->http_response([
                'user' => $user,
                'restaurant' => $restaurant,
                'token' => $token,
                'redirect_to' => $validated['is_restaurant_owner'] ? '/restaurant/dashboard' : '/customer'
            ], 201);
        }

        return $this->http_response('Cannot register at the moment, please reload the page and try again!!!', 400);
    }

    public function user()
    {
        $user = Auth::user();
        return $this->http_response($user, 200);
    }

    public function profile()
    {
        $user = Auth::user();

        // Get user's restaurant if they are an owner
        $restaurant = null;
        if ($user->role === 'owner') {
            $restaurant = Restaurant::where('owner_id', $user->id)->first();
        }

        return $this->http_response([
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
            'restaurant' => $restaurant ? [
                'id' => $restaurant->id,
                'owner_id' => $restaurant->owner_id,
                'name' => $restaurant->name,
                'description' => $restaurant->description,
                'address' => $restaurant->address,
                'phone' => $restaurant->phone,
                'is_active' => $restaurant->is_active,
                'logo_path' => $restaurant->logo_path,
                'logo_url' => $restaurant->logo_url,
                'created_at' => $restaurant->created_at,
                'updated_at' => $restaurant->updated_at,
            ] : null
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return $this->http_response(['user' => $user], 200);
    }

    public function updateRestaurant(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'owner') {
            return $this->http_response(['error' => 'Only restaurant owners can update restaurant data'], 403);
        }

        $restaurant = Restaurant::where('owner_id', $user->id)->first();
        if (!$restaurant) {
            return $this->http_response(['error' => 'Restaurant not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'phone' => 'string|max:20',
            'address' => 'string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'logo_url' => 'nullable|url|max:500'
        ]);

        // Handle logo upload or URL
        $hasNewLogo = false;

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($restaurant->logo_path) {
                Storage::disk('public')->delete($restaurant->logo_path);
            }

            $logoPath = $request->file('logo')->store('restaurants', 'public');
            $validated['logo_path'] = $logoPath;
            $validated['logo_url'] = null; // Clear URL if file is uploaded
            $hasNewLogo = true;
        } elseif (!empty($validated['logo_url'])) {
            // If URL is provided, clear the file path
            $validated['logo_path'] = null;
            $hasNewLogo = true;
        } elseif (isset($validated['logo_url']) && empty($validated['logo_url'])) {
            // If URL field is empty string, clear it
            $validated['logo_url'] = null;
        }

        $restaurant->update($validated);

        return $this->http_response(['restaurant' => $restaurant], 200);
    }

    function logout()
    {
        return auth()->user()->currentAccessToken()->delete();
    }

    function logout_all()
    {
        return auth()->user()->tokens()->delete();
    }

    function change_password(Request $request)
    {

        $validated = $request->validate([
            'current_password' => 'required|min:8|max:20',
            'password' => 'required|min:8|max:20|confirmed',
        ]);


        // Get the loggedin user

        $user = Auth()->user();

        // Check current user password
        $matched = Hash::check($validated['current_password'], $user->password);

        if ($matched) {
            // Update the current password

            $user->password = Hash::make($validated['password']);

            // Save the changes
            if ($user->save()) {
                // logout from everywhere
                // return auth()->user()->tokens()->delete();
                self::logout_all();
            }

        }

        return 'Your current password is incorrect';

    }



}
