<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateOrderStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update order statuses based on preparation and delivery times';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting order status updates...');

        $updatedCount = 0;

        // Get orders that need status updates
        $orders = Order::whereIn('status', ['preparing', 'on_the_way'])
            ->with('items.dish')
            ->get();

        foreach ($orders as $order) {
            $order->updateStatusWithTimestamp();

            if ($order->isDirty('status')) {
                $oldStatus = $order->getOriginal('status');
                $newStatus = $order->status;
                $order->save();

                $updatedCount++;

                $this->line("Order #{$order->id}: {$oldStatus} → {$newStatus}");

                Log::info("Order status updated", [
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'placed_at' => $order->placed_at,
                    'preparing_at' => $order->preparing_at,
                    'on_the_way_at' => $order->on_the_way_at,
                    'delivered_at' => $order->delivered_at,
                ]);
            }
        }

        $this->info("Completed. Updated {$updatedCount} order(s).");

        return 0;
    }
}
