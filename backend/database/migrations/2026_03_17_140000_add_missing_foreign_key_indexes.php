<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var array<string, array<string, array<int, string>>>
     */
    private array $indexes = [
        'activities' => [
            'activities_user_id_idx' => ['user_id'],
            'activities_time_entry_id_idx' => ['time_entry_id'],
        ],
        'app_notifications' => [
            'app_notifications_sender_id_idx' => ['sender_id'],
        ],
        'attendance_punches' => [
            'attendance_punches_organization_id_idx' => ['organization_id'],
        ],
        'attendance_time_edit_requests' => [
            'attendance_time_edit_requests_reviewed_by_idx' => ['reviewed_by'],
        ],
        'chat_conversations' => [
            'chat_conversations_participant_two_id_idx' => ['participant_two_id'],
        ],
        'chat_group_messages' => [
            'chat_group_messages_sender_id_idx' => ['sender_id'],
        ],
        'chat_group_typing_statuses' => [
            'chat_group_typing_statuses_user_id_idx' => ['user_id'],
        ],
        'chat_groups' => [
            'chat_groups_created_by_idx' => ['created_by'],
        ],
        'chat_messages' => [
            'chat_messages_sender_id_idx' => ['sender_id'],
        ],
        'chat_typing_statuses' => [
            'chat_typing_statuses_user_id_idx' => ['user_id'],
        ],
        'invitations' => [
            'invitations_invited_by_idx' => ['invited_by'],
            'invitations_accepted_by_user_id_idx' => ['accepted_by_user_id'],
        ],
        'invites' => [
            'invites_created_by_idx' => ['created_by'],
        ],
        'invoice_items' => [
            'invoice_items_invoice_id_idx' => ['invoice_id'],
            'invoice_items_time_entry_id_idx' => ['time_entry_id'],
        ],
        'invoices' => [
            'invoices_organization_id_idx' => ['organization_id'],
        ],
        'leave_requests' => [
            'leave_requests_reviewed_by_idx' => ['reviewed_by'],
            'leave_requests_revoke_reviewed_by_idx' => ['revoke_reviewed_by'],
        ],
        'missed_time_requests' => [
            'missed_time_requests_reviewed_by_idx' => ['reviewed_by'],
            'missed_time_requests_approved_time_entry_id_idx' => ['approved_time_entry_id'],
        ],
        'organization_invitations' => [
            'organization_invitations_invited_by_user_id_idx' => ['invited_by_user_id'],
            'organization_invitations_accepted_user_id_idx' => ['accepted_user_id'],
        ],
        'organizations' => [
            'organizations_owner_user_id_idx' => ['owner_user_id'],
        ],
        'payroll_allowances' => [
            'payroll_allowances_payroll_structure_id_idx' => ['payroll_structure_id'],
        ],
        'payroll_deductions' => [
            'payroll_deductions_payroll_structure_id_idx' => ['payroll_structure_id'],
        ],
        'payroll_structures' => [
            'payroll_structures_user_id_idx' => ['user_id'],
        ],
        'payrolls' => [
            'payrolls_generated_by_idx' => ['generated_by'],
            'payrolls_updated_by_idx' => ['updated_by'],
            'payrolls_user_id_idx' => ['user_id'],
        ],
        'payslips' => [
            'payslips_generated_by_idx' => ['generated_by'],
            'payslips_paid_by_idx' => ['paid_by'],
            'payslips_payroll_structure_id_idx' => ['payroll_structure_id'],
            'payslips_user_id_idx' => ['user_id'],
        ],
        'projects' => [
            'projects_organization_id_idx' => ['organization_id'],
        ],
        'report_group_user' => [
            'report_group_user_user_id_idx' => ['user_id'],
        ],
        'screenshots' => [
            'screenshots_time_entry_id_idx' => ['time_entry_id'],
        ],
        'tasks' => [
            'tasks_assignee_id_idx' => ['assignee_id'],
            'tasks_project_id_idx' => ['project_id'],
        ],
        'time_entries' => [
            'time_entries_project_id_idx' => ['project_id'],
            'time_entries_task_id_idx' => ['task_id'],
        ],
        'users' => [
            'users_invited_by_idx' => ['invited_by'],
            'users_organization_id_idx' => ['organization_id'],
        ],
    ];

    public function up(): void
    {
        foreach ($this->indexes as $table => $indexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            $applicableIndexes = $this->applicableIndexes($table, $indexes);

            if ($applicableIndexes === []) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($applicableIndexes) {
                foreach ($applicableIndexes as $name => $columns) {
                    $blueprint->index($columns, $name);
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->indexes as $table => $indexes) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            $applicableIndexes = $this->applicableIndexes($table, $indexes);

            if ($applicableIndexes === []) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($applicableIndexes) {
                foreach (array_keys($applicableIndexes) as $name) {
                    $blueprint->dropIndex($name);
                }
            });
        }
    }

    /**
     * @param array<string, array<int, string>> $indexes
     * @return array<string, array<int, string>>
     */
    private function applicableIndexes(string $table, array $indexes): array
    {
        return array_filter(
            $indexes,
            fn (array $columns): bool => $this->tableHasAllColumns($table, $columns),
        );
    }

    /**
     * @param array<int, string> $columns
     */
    private function tableHasAllColumns(string $table, array $columns): bool
    {
        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                return false;
            }
        }

        return true;
    }
};
