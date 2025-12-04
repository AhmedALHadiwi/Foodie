<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'restaurant_id',
        'driver_id',
        'subtotal',
        'delivery_fee',
        'tax',
        'total_amount',
        'status',
        'placed_at',
        'estimated_delivery_at',
        'delivery_address',
        'payment_id',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'tax' => 'float',
        'total_amount' => 'float',
        'placed_at' => 'datetime',
        'estimated_delivery_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function items(): HasMany
    {
        return $this->orderItems();
    }

    public function getPreparationTimeMinutes(): int
    {
        return $this->items->max('dish.preparing_time') ?? $this->items->max('dish.prep_time_minutes') ?? 15;
    }

    public function getDeliveryTimeMinutes(): int
    {
        return $this->items->max('dish.on_the_way_time') ?? $this->items->max('dish.delivery_time_minutes') ?? 20;
    }

    public function getTotalPreparationTime(): int
    {
        return $this->getPreparationTimeMinutes() + $this->getDeliveryTimeMinutes();
    }

    public function getEstimatedDeliveryAt(): ?Carbon
    {
        if (!$this->placed_at) {
            return null;
        }

        return $this->placed_at->copy()->addMinutes($this->getTotalPreparationTime());
    }

    public function calculateStatusTimestamps(): void
    {
        if (!$this->placed_at) {
            return;
        }

        $totalMinutes = $this->getTotalPreparationTime();
        $this->estimated_delivery_at = $this->placed_at->copy()->addMinutes($totalMinutes);
    }

    public function shouldUpdateStatus(): bool
    {
        if (!$this->placed_at) {
            return false;
        }

        $now = now();
        $prepMinutes = $this->getPreparationTimeMinutes();
        $deliveryMinutes = $this->getDeliveryTimeMinutes();

        if ($this->status === 'preparing') {
            $prepTimeEnd = $this->placed_at->copy()->addMinutes($prepMinutes);
            return $now->gte($prepTimeEnd);
        }

        if ($this->status === 'on_the_way') {
            $deliveryTimeEnd = $this->placed_at->copy()->addMinutes($prepMinutes + $deliveryMinutes);
            return $now->gte($deliveryTimeEnd);
        }

        return false;
    }

    public function getNextStatus(): ?string
    {
        if ($this->status === 'preparing' && $this->shouldUpdateStatus()) {
            return 'on_the_way';
        }

        if ($this->status === 'on_the_way' && $this->shouldUpdateStatus()) {
            return 'delivered';
        }

        return null;
    }

    public function updateStatusWithTimestamp(): void
    {
        $nextStatus = $this->getNextStatus();
        if ($nextStatus) {
            $this->status = $nextStatus;
        }
    }
}
