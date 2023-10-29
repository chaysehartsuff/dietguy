<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('diet_food', function (Blueprint $table) {
            $table->id();
            $table->foreignId('active_diet_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('restriction_level', [1,2,3]);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diet_food');
    }
};
