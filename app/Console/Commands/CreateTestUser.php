<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:create-test-user')]
#[Description('Creates a test user')]
class CreateTestUser extends Command
{
    protected $signature = 'app:create-test-user';
    protected $description = 'Creates a test user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
