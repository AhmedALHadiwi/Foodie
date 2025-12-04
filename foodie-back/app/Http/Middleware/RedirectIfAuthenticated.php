<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            // If user is authenticated, redirect to restaurants page
            return response()->json([
                'message' => 'Already authenticated',
                'redirect_to' => '/restaurants'
            ], 200);
        }

        return $next($request);
    }
}
