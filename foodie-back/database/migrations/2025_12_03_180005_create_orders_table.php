<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('restaurant_id')->constrained();
            $table->foreignId('driver_id')->nullable()->constrained('users');
            $table->float('subtotal');
            $table->float('delivery_fee');
            $table->float('tax');
            $table->float('total_amount');
            $table->string('status', 30); // pending | preparing | on_the_way | delivered | cancelled
            $table->dateTime('placed_at');
            $table->dateTime('estimated_delivery_at')->nullable();
            $table->text('delivery_address');
            $table->foreignId('payment_id')->nullable()->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
