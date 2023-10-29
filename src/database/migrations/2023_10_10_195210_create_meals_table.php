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
        Schema::create('meals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diet_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('food_score', [1,2,3]);
            $table->smallInteger('calories');
            $table->double('protein_gram', 8, 2);
            $table->double('fat_gram', 8, 2);
            $table->double('carb_gram', 8, 2);
            $table->time('timestamp');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meals');
    }
};
