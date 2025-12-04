# Automated Order Tracking System

## Overview

This system automatically updates order statuses based on preparation and delivery times defined for each dish.

## How It Works

### 1. Dish Timing Fields

Each dish has two timing fields:

-   `preparing_time`: Time needed to prepare the dish (in minutes)
-   `on_the_way_time`: Time needed for delivery (in minutes)

### 2. Order Status Flow

```
Order Created → Preparing → On the Way → Delivered
```

### 3. Automatic Transitions

-   **Preparing → On the Way**: After `preparing_time` from order placement
-   **On the Way → Delivered**: After `preparing_time + on_the_way_time` from order placement

### 4. Timestamp Storage

Orders store exact timestamps for each status:

-   `preparing_at`: When preparation starts (same as order placement)
-   `on_the_way_at`: When order should be "on the way"
-   `delivered_at`: When order should be "delivered"

## Implementation Details

### Database Changes

-   Added `preparing_time` and `on_the_way_time` to `dishes` table
-   Added `preparing_at`, `on_the_way_at`, `delivered_at` to `orders` table
-   Order model includes timing calculation methods

### Laravel Command

```bash
php artisan orders:update-statuses
```

### Scheduled Job

The command runs automatically every minute via Laravel's scheduler.

## Setting Up Cron Job

Add this to your crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## API Integration

All order-related APIs automatically check and update statuses:

-   `GET /api/orders/{id}` - Updates single order status
-   `GET /api/customer/orders` - Updates all customer orders
-   `GET /api/restaurants/{id}/orders` - Updates restaurant orders

## Frontend Integration

### Restaurant Dashboard UI

Restaurant owners can set cooking times when creating/editing menu items:

-   **Preparing Time**: Minutes needed to prepare the dish
-   **On the Way Time**: Minutes needed for delivery

### Customer Order Tracking

Customers see real-time status updates based on calculated timestamps.

## Testing

To test manually:

```bash
# Check current command
php artisan orders:update-statuses

# View schedule
php artisan schedule:list
```

## Default Values

If no times are set:

-   Preparing time: 15 minutes
-   On the way time: 20 minutes

## Example Timeline

Pizza with preparing_time=10, on_the_way_time=15, ordered at 8:00:

-   8:00 - Status: Preparing (preparing_at: 8:00)
-   8:10 - Status: On the Way (on_the_way_at: 8:10)
-   8:25 - Status: Delivered (delivered_at: 8:25)

## UI Features

### Menu Item Form

Restaurant owners can:

-   Set preparing time when creating new dishes
-   Update cooking times when editing existing dishes
-   Leave fields empty to use default values

### Order Management

-   Automatic status updates without manual intervention
-   Real-time tracking for customers
-   Accurate delivery estimates
