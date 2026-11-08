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
        Schema::create('password_appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('username');
            $table->string('email');
            $table->text('message')->nullable();
            $table->string('status')->default('unverified')->index();

            // One-time email code proving the requester controls the address.
            $table->string('verification_code_hash')->nullable();
            $table->timestamp('verification_expires_at')->nullable();
            $table->unsignedTinyInteger('verification_attempts')->default(0);
            $table->timestamp('email_verified_at')->nullable();

            // Admin-issued reset link (only the hash is stored).
            $table->string('reset_token_hash')->nullable()->unique();
            $table->timestamp('reset_expires_at')->nullable();
            $table->timestamp('reset_used_at')->nullable();

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_appeals');
    }
};
