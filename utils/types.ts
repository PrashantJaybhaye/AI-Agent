export interface TranscriptEntry {
    role: "user" | "assistant";
    time_in_call_secs: number;
    message: string;
}

export interface ConversationMetadata {
    start_time_unix_secs: number;
    call_duration_secs: number;
    cost: number;
}

export interface Analysis {
    evaluation_criteria_results: Record<string, string>;
    data_collection_results: Record<string, string>;
    call_successful: "success" | "failure";
    transcript_summary: string;
    call_summary_title: string;
}

export interface ConversationResponse {
    agent_id: string;
    conversation_id: string;
    status: string;
    transcript: TranscriptEntry[];
    metadata: ConversationMetadata;
    has_audio: boolean;
    has_user_audio: boolean;
    has_response_audio: boolean;
    analysis: Analysis;
}

export interface Session {
    id: string;
    created_at: string;
    user_id: string;
    status: "in-progress" | "done" | "failed";
    conv_id: string;
    tokens?: number;
    call_duration_secs?: number;
    transcript?: string;
    call_summary_title?: string;
}

export interface StreakEntry {
    id?: string;
    user_id: string;
    session_type: string;
    session_title: string;
    session_details?: {
        duration_minutes?: number;
        accent_color?: string;
        audio_enabled?: boolean;
        [key: string]: any;
    };
    completion_time: any;
    total_session_duration_seconds: number;
}

export interface Achievement {
    id?: string;
    user_id: string;
    achievement_type: string;
    title: string;
    description: string;
    earned_at: any;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    username?: string;
    bio?: string;
    location?: string;
    photoURL?: string;
    isAdmin: boolean;
    createdAt: any;
    lastLoginAt: any;
    subscriptionPlan?: 'free' | 'premium';
}
