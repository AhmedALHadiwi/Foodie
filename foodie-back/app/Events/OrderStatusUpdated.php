<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order_id;
    public $new_status;
    public $restaurant_id;
    public $user_id;

    /**
     * Create a new event instance.
     */
    public function __construct($orderId, $newStatus, $restaurantId, $userId)
    {
        $this->order_id = $orderId;
        $this->new_status = $newStatus;
        $this->restaurant_id = $restaurantId;
        $this->user_id = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user_id),
            new PrivateChannel('restaurant.' . $this->restaurant_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order_id,
            'new_status' => $this->new_status,
            'timestamp' => now()->toISOString(),
        ];
    }
}
