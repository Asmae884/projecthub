<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

 
        $totalProjects = Project::where('user_id', $user->id)
            ->orWhereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->count();

        // Tasks statistics
        $allTasks = Task::whereHas('project', function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->orWhereHas('members', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
        });

        $totalTasks = $allTasks->count();
        $completedTasks = (clone $allTasks)->where('status', 'completed')->count();
        $inProgressTasks = (clone $allTasks)->where('status', 'in_progress')->count();
        $pendingTasks = (clone $allTasks)->where('status', 'pending')->count();

        // Recent tasks
        $recentTasks = $allTasks->with(['project', 'assignee'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Tasks by project
        $tasksByProject = Task::selectRaw('projects.name, COUNT(tasks.id) as count')
            ->join('projects', 'tasks.project_id', '=', 'projects.id')
            ->whereHas('project', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->groupBy('projects.id', 'projects.name')
            ->get();

        // Tasks by status for pie chart
        $tasksByStatus = [
            'pending' => $pendingTasks,
            'in_progress' => $inProgressTasks,
            'completed' => $completedTasks,
        ];

        return response()->json([
            'total_projects' => $totalProjects,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'in_progress_tasks' => $inProgressTasks,
            'pending_tasks' => $pendingTasks,
            'recent_tasks' => $recentTasks,
            'tasks_by_project' => $tasksByProject,
            'tasks_by_status' => $tasksByStatus,
        ]);
    }
}