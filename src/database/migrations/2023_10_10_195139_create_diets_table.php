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
        Schema::create('diets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->smallInteger('calorie_max')->nullable();
            $table->smallInteger('calorie_min')->nullable();
            $table->smallInteger('protein_max');
            $table->smallInteger('fat_max');
            $table->smallInteger('carb_max');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diets');
    }
};
