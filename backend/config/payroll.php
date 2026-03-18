<?php

$frontendUrl = rtrim((string) env('FRONTEND_URL', env('FRONTEND_APP_URL', '')), '/');
$payrollUrl = $frontendUrl !== '' ? $frontendUrl.'/payroll' : '';

return [
    'mode' => env('PAYROLL_MODE', 'mock'), // mock | stripe_test | stripe_live
    'default_currency' => env('PAYROLL_DEFAULT_CURRENCY', 'INR'),
    'stripe_disable_ssl_verify' => filter_var(env('PAYROLL_STRIPE_DISABLE_SSL_VERIFY', false), FILTER_VALIDATE_BOOL),
    'stripe_return_url' => env('PAYROLL_STRIPE_RETURN_URL', $payrollUrl),
    'stripe_success_url' => env('PAYROLL_STRIPE_SUCCESS_URL', $payrollUrl !== '' ? $payrollUrl.'?payment=success' : ''),
    'stripe_cancel_url' => env('PAYROLL_STRIPE_CANCEL_URL', $payrollUrl !== '' ? $payrollUrl.'?payment=cancelled' : ''),
];
