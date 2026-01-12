// Task Priority enum matching backend
export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

// Task Status enum matching backend
export enum Status {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    COMPLETED = 'COMPLETED',
}

// User type (simplified from auth types)
export interface User {
    id: string
    email: string
    name: string
    createdAt: string
    updatedAt: string
}

// Task interface
export interface Task {
    id: string
    title: string
    description: string
    dueDate: string
    priority: Priority
    status: Status
    creatorId: string
    assignedToId: string
    creator: User
    assignee: User
    createdAt: string
    updatedAt: string
}

// Create Task DTO
export interface CreateTaskDto {
    title: string
    description: string
    dueDate: string
    priority: Priority
    status?: Status
    assignedToId: string
}

// Update Task DTO
export interface UpdateTaskDto {
    title?: string
    description?: string
    dueDate?: string
    priority?: Priority
    status?: Status
    assignedToId?: string
}

// Task Query DTO for filtering
export interface TaskQueryDto {
    status?: Status
    priority?: Priority
    sortByDueDate?: 'asc' | 'desc'
    overdue?: string
    assignedToMe?: string
    createdByMe?: string
}

// API Response types
export interface TaskResponse {
    task: Task
}

export interface TasksResponse {
    tasks: Task[]
}
