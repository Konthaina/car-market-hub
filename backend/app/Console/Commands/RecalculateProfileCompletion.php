<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class RecalculateProfileCompletion extends Command
{
    protected $signature = 'profile:recalculate';
    protected $description = 'Recalculate profile completion percentage for all users';

    public function handle()
    {
        $users = User::all();
        $updated = 0;

        foreach ($users as $user) {
            $user->updateProfileComplete();
            $updated++;
        }

        $this->info("Updated profile completion for {$updated} users.");
    }
}
