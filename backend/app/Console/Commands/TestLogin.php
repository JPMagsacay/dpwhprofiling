<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:test-login')]
#[Description('Test login functionality')]
class TestLogin extends Command
{
    protected $signature = 'app:test-login';
    protected $description = 'Test login functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
