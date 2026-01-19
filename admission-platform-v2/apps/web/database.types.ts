export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      "2V_algorithm_config": {
        Row: {
          algorithm_type: string
          content_balancing: Json | null
          created_at: string | null
          description: string | null
          display_name: string | null
          exposure_control: boolean | null
          grade_boundaries: Json | null
          id: string
          initial_theta: number | null
          irt_model: string | null
          max_information_weight: number | null
          pass_threshold: number | null
          penalty_for_blank: number | null
          penalty_for_wrong: Json | null
          percentile_calculation: string | null
          score_increment: number | null
          scoring_method: string | null
          se_threshold: number | null
          section_score_max: number | null
          section_score_min: number | null
          section_weights: Json | null
          simple_difficulty_increment: number | null
          theta_max: number | null
          theta_min: number | null
          total_score_max: number | null
          total_score_min: number | null
          updated_at: string | null
        }
        Insert: {
          algorithm_type: string
          content_balancing?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          exposure_control?: boolean | null
          grade_boundaries?: Json | null
          id?: string
          initial_theta?: number | null
          irt_model?: string | null
          max_information_weight?: number | null
          pass_threshold?: number | null
          penalty_for_blank?: number | null
          penalty_for_wrong?: Json | null
          percentile_calculation?: string | null
          score_increment?: number | null
          scoring_method?: string | null
          se_threshold?: number | null
          section_score_max?: number | null
          section_score_min?: number | null
          section_weights?: Json | null
          simple_difficulty_increment?: number | null
          theta_max?: number | null
          theta_min?: number | null
          total_score_max?: number | null
          total_score_min?: number | null
          updated_at?: string | null
        }
        Update: {
          algorithm_type?: string
          content_balancing?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          exposure_control?: boolean | null
          grade_boundaries?: Json | null
          id?: string
          initial_theta?: number | null
          irt_model?: string | null
          max_information_weight?: number | null
          pass_threshold?: number | null
          penalty_for_blank?: number | null
          penalty_for_wrong?: Json | null
          percentile_calculation?: string | null
          score_increment?: number | null
          scoring_method?: string | null
          se_threshold?: number | null
          section_score_max?: number | null
          section_score_min?: number | null
          section_weights?: Json | null
          simple_difficulty_increment?: number | null
          theta_max?: number | null
          theta_min?: number | null
          total_score_max?: number | null
          total_score_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "2V_algorithm_config_test": {
        Row: {
          algorithm_category: string
          algorithm_type: string
          content_balancing: Json | null
          created_at: string | null
          exposure_control: boolean | null
          id: string
          initial_theta: number | null
          irt_model: string | null
          max_information_weight: number | null
          se_threshold: number | null
          simple_difficulty_increment: number | null
          test_type: string
          theta_max: number | null
          theta_min: number | null
          track_type: string
          updated_at: string | null
        }
        Insert: {
          algorithm_category?: string
          algorithm_type: string
          content_balancing?: Json | null
          created_at?: string | null
          exposure_control?: boolean | null
          id?: string
          initial_theta?: number | null
          irt_model?: string | null
          max_information_weight?: number | null
          se_threshold?: number | null
          simple_difficulty_increment?: number | null
          test_type: string
          theta_max?: number | null
          theta_min?: number | null
          track_type: string
          updated_at?: string | null
        }
        Update: {
          algorithm_category?: string
          algorithm_type?: string
          content_balancing?: Json | null
          created_at?: string | null
          exposure_control?: boolean | null
          id?: string
          initial_theta?: number | null
          irt_model?: string | null
          max_information_weight?: number | null
          se_threshold?: number | null
          simple_difficulty_increment?: number | null
          test_type?: string
          theta_max?: number | null
          theta_min?: number | null
          track_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      "2V_gmat_student_progress": {
        Row: {
          created_at: string | null
          gmat_cycle: string
          id: string
          seen_question_ids: string[] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gmat_cycle: string
          id?: string
          seen_question_ids?: string[] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gmat_cycle?: string
          id?: string
          seen_question_ids?: string[] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "2V_gmat_student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_lesson_materials": {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          material_type: string
          order_index: number | null
          pdf_storage_path: string
          question_allocation: Json | null
          question_requirements: Json | null
          section: string
          test_type: string
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          material_type: string
          order_index?: number | null
          pdf_storage_path: string
          question_allocation?: Json | null
          question_requirements?: Json | null
          section: string
          test_type: string
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          material_type?: string
          order_index?: number | null
          pdf_storage_path?: string
          question_allocation?: Json | null
          question_requirements?: Json | null
          section?: string
          test_type?: string
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      "2V_material_assignments": {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string | null
          id: string
          is_unlocked: boolean | null
          material_id: string
          student_id: string
          unlocked_at: string | null
          viewed_at: string | null
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          material_id: string
          student_id: string
          unlocked_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          material_id?: string
          student_id?: string
          unlocked_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "2V_material_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_material_assignments_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "2V_lesson_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_material_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_profiles": {
        Row: {
          auth_uid: string | null
          average_school_grade: number | null
          created_at: string | null
          email: string
          esigenze_speciali: boolean | null
          id: string
          last_password_change: string | null
          must_change_password: boolean | null
          name: string
          past_test_results: Json | null
          platform_version: string | null
          real_test_date: string | null
          roles: Json
          student_notes: string | null
          tests: Json | null
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_uid?: string | null
          average_school_grade?: number | null
          created_at?: string | null
          email: string
          esigenze_speciali?: boolean | null
          id?: string
          last_password_change?: string | null
          must_change_password?: boolean | null
          name: string
          past_test_results?: Json | null
          platform_version?: string | null
          real_test_date?: string | null
          roles?: Json
          student_notes?: string | null
          tests?: Json | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_uid?: string | null
          average_school_grade?: number | null
          created_at?: string | null
          email?: string
          esigenze_speciali?: boolean | null
          id?: string
          last_password_change?: string | null
          must_change_password?: boolean | null
          name?: string
          past_test_results?: Json | null
          platform_version?: string | null
          real_test_date?: string | null
          roles?: Json
          student_notes?: string | null
          tests?: Json | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_2v_profiles_tutor"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_profiles_test": {
        Row: {
          auth_uid: string | null
          created_at: string | null
          email: string
          esigenze_speciali: boolean | null
          id: string
          last_password_change: string | null
          must_change_password: boolean | null
          name: string
          roles: Json
          tests: Json | null
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_uid?: string | null
          created_at?: string | null
          email: string
          esigenze_speciali?: boolean | null
          id?: string
          last_password_change?: string | null
          must_change_password?: boolean | null
          name: string
          roles?: Json
          tests?: Json | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_uid?: string | null
          created_at?: string | null
          email?: string
          esigenze_speciali?: boolean | null
          id?: string
          last_password_change?: string | null
          must_change_password?: boolean | null
          name?: string
          roles?: Json
          tests?: Json | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "2V_questions": {
        Row: {
          answers: Json
          conversion_info: Json | null
          created_at: string
          created_by: string | null
          difficulty: string | null
          difficulty_level: number | null
          duplicate_question_ids: Json | null
          id: string
          irt_difficulty: number | null
          irt_discrimination: number | null
          irt_guessing: number | null
          is_active: boolean
          macro_section: string | null
          materia: string | null
          question_data: Json
          question_number: number
          question_type: string
          Questions_toReview: Json | null
          review_info: Json | null
          section: string
          test_id: string
          test_type: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          answers: Json
          conversion_info?: Json | null
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          difficulty_level?: number | null
          duplicate_question_ids?: Json | null
          id?: string
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          is_active?: boolean
          macro_section?: string | null
          materia?: string | null
          question_data: Json
          question_number: number
          question_type: string
          Questions_toReview?: Json | null
          review_info?: Json | null
          section: string
          test_id: string
          test_type: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          conversion_info?: Json | null
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          difficulty_level?: number | null
          duplicate_question_ids?: Json | null
          id?: string
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          is_active?: boolean
          macro_section?: string | null
          materia?: string | null
          question_data?: Json
          question_number?: number
          question_type?: string
          Questions_toReview?: Json | null
          review_info?: Json | null
          section?: string
          test_id?: string
          test_type?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "2V_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "2V_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_questions_test": {
        Row: {
          answers: Json
          created_at: string
          created_by: string | null
          difficulty: string | null
          difficulty_level: number | null
          id: string
          irt_difficulty: number | null
          irt_discrimination: number | null
          irt_guessing: number | null
          is_active: boolean
          materia: string | null
          question_data: Json
          question_number: number
          question_type: string
          section: string
          test_id: string
          test_type: string
          updated_at: string
        }
        Insert: {
          answers: Json
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          difficulty_level?: number | null
          id?: string
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          is_active?: boolean
          materia?: string | null
          question_data: Json
          question_number: number
          question_type: string
          section: string
          test_id: string
          test_type: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          difficulty_level?: number | null
          id?: string
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          is_active?: boolean
          materia?: string | null
          question_data?: Json
          question_number?: number
          question_type?: string
          section?: string
          test_id?: string
          test_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      "2V_section_order": {
        Row: {
          created_at: string | null
          id: string
          section_order: string[]
          test_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          section_order?: string[]
          test_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          section_order?: string[]
          test_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      "2V_student_answers": {
        Row: {
          answer: Json
          assignment_id: string
          attempt_number: number
          auto_score: number | null
          created_at: string
          display_order: number | null
          guided_settings: Json | null
          id: string
          is_flagged: boolean
          is_guided: boolean
          question_id: string
          question_order: number | null
          student_id: string
          submitted_at: string
          time_spent_seconds: number | null
          tutor_feedback: string | null
          tutor_score: number | null
          updated_at: string
        }
        Insert: {
          answer: Json
          assignment_id: string
          attempt_number?: number
          auto_score?: number | null
          created_at?: string
          display_order?: number | null
          guided_settings?: Json | null
          id?: string
          is_flagged?: boolean
          is_guided?: boolean
          question_id: string
          question_order?: number | null
          student_id: string
          submitted_at?: string
          time_spent_seconds?: number | null
          tutor_feedback?: string | null
          tutor_score?: number | null
          updated_at?: string
        }
        Update: {
          answer?: Json
          assignment_id?: string
          attempt_number?: number
          auto_score?: number | null
          created_at?: string
          display_order?: number | null
          guided_settings?: Json | null
          id?: string
          is_flagged?: boolean
          is_guided?: boolean
          question_id?: string
          question_order?: number | null
          student_id?: string
          submitted_at?: string
          time_spent_seconds?: number | null
          tutor_feedback?: string | null
          tutor_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "2V_student_answers_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "2V_test_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "2V_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_student_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_student_answers_test": {
        Row: {
          answer: Json
          assignment_id: string
          attempt_number: number
          auto_score: number | null
          created_at: string
          display_order: number | null
          id: string
          is_flagged: boolean
          question_id: string
          student_id: string
          submitted_at: string
          time_spent_seconds: number | null
          tutor_feedback: string | null
          tutor_score: number | null
          updated_at: string
        }
        Insert: {
          answer: Json
          assignment_id: string
          attempt_number?: number
          auto_score?: number | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_flagged?: boolean
          question_id: string
          student_id: string
          submitted_at?: string
          time_spent_seconds?: number | null
          tutor_feedback?: string | null
          tutor_score?: number | null
          updated_at?: string
        }
        Update: {
          answer?: Json
          assignment_id?: string
          attempt_number?: number
          auto_score?: number | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_flagged?: boolean
          question_id?: string
          student_id?: string
          submitted_at?: string
          time_spent_seconds?: number | null
          tutor_feedback?: string | null
          tutor_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_answers_test_assignment"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "2V_test_assignments_test"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student_answers_test_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "2V_questions_test"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student_answers_test_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "2V_profiles_test"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_test_assignments": {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          completion_details: Json | null
          completion_status: string | null
          current_attempt: number
          due_date: string | null
          id: string
          results_viewable_by_student: boolean | null
          start_time: string | null
          status: string
          student_id: string
          test_id: string
          total_attempts: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          completion_details?: Json | null
          completion_status?: string | null
          current_attempt?: number
          due_date?: string | null
          id?: string
          results_viewable_by_student?: boolean | null
          start_time?: string | null
          status?: string
          student_id: string
          test_id: string
          total_attempts?: number
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          completion_details?: Json | null
          completion_status?: string | null
          current_attempt?: number
          due_date?: string | null
          id?: string
          results_viewable_by_student?: boolean | null
          start_time?: string | null
          status?: string
          student_id?: string
          test_id?: string
          total_attempts?: number
        }
        Relationships: [
          {
            foreignKeyName: "2V_test_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_test_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "2V_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_test_assignments_test": {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          completion_details: Json | null
          current_attempt: number
          due_date: string | null
          id: string
          start_time: string | null
          status: string
          student_id: string
          test_id: string
          total_attempts: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          completion_details?: Json | null
          current_attempt?: number
          due_date?: string | null
          id?: string
          start_time?: string | null
          status?: string
          student_id: string
          test_id: string
          total_attempts?: number
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          completion_details?: Json | null
          current_attempt?: number
          due_date?: string | null
          id?: string
          start_time?: string | null
          status?: string
          student_id?: string
          test_id?: string
          total_attempts?: number
        }
        Relationships: []
      }
      "2V_test_track_config": {
        Row: {
          adaptivity_mode: string | null
          algorithm_id: string | null
          allow_bookmarks: boolean | null
          allow_review_at_end: boolean | null
          assessment_mono_config: Json | null
          base_questions_count: number | null
          base_questions_scope: string | null
          baseline_difficulty: number | null
          can_leave_blank: boolean | null
          created_at: string
          created_by: string | null
          difficulty_levels_count: number | null
          id: string
          max_answer_changes: number | null
          max_pauses: number | null
          max_questions_to_review: number | null
          messaggio_iniziale_test: string | null
          navigation_between_sections: string | null
          navigation_mode: string | null
          pause_duration_minutes: number | null
          pause_mode: string | null
          pause_sections: Json | null
          question_order: string | null
          questions_per_section: Json | null
          section_adaptivity_config: Json | null
          section_order: Json | null
          section_order_mode: string | null
          test_start_message: string | null
          test_type: string
          time_per_section: Json | null
          total_time_minutes: number | null
          track_type: string
          training_config: Json | null
          updated_at: string
          use_base_questions: boolean | null
        }
        Insert: {
          adaptivity_mode?: string | null
          algorithm_id?: string | null
          allow_bookmarks?: boolean | null
          allow_review_at_end?: boolean | null
          assessment_mono_config?: Json | null
          base_questions_count?: number | null
          base_questions_scope?: string | null
          baseline_difficulty?: number | null
          can_leave_blank?: boolean | null
          created_at?: string
          created_by?: string | null
          difficulty_levels_count?: number | null
          id?: string
          max_answer_changes?: number | null
          max_pauses?: number | null
          max_questions_to_review?: number | null
          messaggio_iniziale_test?: string | null
          navigation_between_sections?: string | null
          navigation_mode?: string | null
          pause_duration_minutes?: number | null
          pause_mode?: string | null
          pause_sections?: Json | null
          question_order?: string | null
          questions_per_section?: Json | null
          section_adaptivity_config?: Json | null
          section_order?: Json | null
          section_order_mode?: string | null
          test_start_message?: string | null
          test_type: string
          time_per_section?: Json | null
          total_time_minutes?: number | null
          track_type: string
          training_config?: Json | null
          updated_at?: string
          use_base_questions?: boolean | null
        }
        Update: {
          adaptivity_mode?: string | null
          algorithm_id?: string | null
          allow_bookmarks?: boolean | null
          allow_review_at_end?: boolean | null
          assessment_mono_config?: Json | null
          base_questions_count?: number | null
          base_questions_scope?: string | null
          baseline_difficulty?: number | null
          can_leave_blank?: boolean | null
          created_at?: string
          created_by?: string | null
          difficulty_levels_count?: number | null
          id?: string
          max_answer_changes?: number | null
          max_pauses?: number | null
          max_questions_to_review?: number | null
          messaggio_iniziale_test?: string | null
          navigation_between_sections?: string | null
          navigation_mode?: string | null
          pause_duration_minutes?: number | null
          pause_mode?: string | null
          pause_sections?: Json | null
          question_order?: string | null
          questions_per_section?: Json | null
          section_adaptivity_config?: Json | null
          section_order?: Json | null
          section_order_mode?: string | null
          test_start_message?: string | null
          test_type?: string
          time_per_section?: Json | null
          total_time_minutes?: number | null
          track_type?: string
          training_config?: Json | null
          updated_at?: string
          use_base_questions?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "2V_test_track_config_algorithm_id_fkey"
            columns: ["algorithm_id"]
            isOneToOne: false
            referencedRelation: "2V_algorithm_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "2V_test_track_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_test_track_config_test": {
        Row: {
          adaptivity_mode: string | null
          algorithm_type: string | null
          assessment_mono_config: Json | null
          base_questions_count: number | null
          base_questions_scope: string | null
          baseline_difficulty: number | null
          can_leave_blank: boolean | null
          created_at: string
          created_by: string | null
          id: string
          max_pauses: number | null
          messaggio_iniziale_test: string | null
          navigation_between_sections: string | null
          navigation_mode: string | null
          pause_duration_minutes: number | null
          pause_mode: string | null
          pause_sections: Json | null
          question_order: string | null
          questions_per_section: Json | null
          section_order: Json | null
          section_order_mode: string | null
          test_start_message: string | null
          test_type: string
          time_per_section: Json | null
          total_time_minutes: number | null
          track_type: string
          training_config: Json | null
          updated_at: string
          use_base_questions: boolean | null
        }
        Insert: {
          adaptivity_mode?: string | null
          algorithm_type?: string | null
          assessment_mono_config?: Json | null
          base_questions_count?: number | null
          base_questions_scope?: string | null
          baseline_difficulty?: number | null
          can_leave_blank?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          max_pauses?: number | null
          messaggio_iniziale_test?: string | null
          navigation_between_sections?: string | null
          navigation_mode?: string | null
          pause_duration_minutes?: number | null
          pause_mode?: string | null
          pause_sections?: Json | null
          question_order?: string | null
          questions_per_section?: Json | null
          section_order?: Json | null
          section_order_mode?: string | null
          test_start_message?: string | null
          test_type: string
          time_per_section?: Json | null
          total_time_minutes?: number | null
          track_type: string
          training_config?: Json | null
          updated_at?: string
          use_base_questions?: boolean | null
        }
        Update: {
          adaptivity_mode?: string | null
          algorithm_type?: string | null
          assessment_mono_config?: Json | null
          base_questions_count?: number | null
          base_questions_scope?: string | null
          baseline_difficulty?: number | null
          can_leave_blank?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          max_pauses?: number | null
          messaggio_iniziale_test?: string | null
          navigation_between_sections?: string | null
          navigation_mode?: string | null
          pause_duration_minutes?: number | null
          pause_mode?: string | null
          pause_sections?: Json | null
          question_order?: string | null
          questions_per_section?: Json | null
          section_order?: Json | null
          section_order_mode?: string | null
          test_start_message?: string | null
          test_type?: string
          time_per_section?: Json | null
          total_time_minutes?: number | null
          track_type?: string
          training_config?: Json | null
          updated_at?: string
          use_base_questions?: boolean | null
        }
        Relationships: []
      }
      "2V_tests": {
        Row: {
          created_at: string | null
          created_by: string | null
          default_duration_mins: number | null
          exercise_type: string
          format: string
          id: string
          is_active: boolean | null
          materia: string | null
          review_info: Json | null
          section: string
          test_number: number
          test_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_duration_mins?: number | null
          exercise_type: string
          format: string
          id?: string
          is_active?: boolean | null
          materia?: string | null
          review_info?: Json | null
          section: string
          test_number: number
          test_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_duration_mins?: number | null
          exercise_type?: string
          format?: string
          id?: string
          is_active?: boolean | null
          materia?: string | null
          review_info?: Json | null
          section?: string
          test_number?: number
          test_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "2V_tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "2V_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "2V_tests_test": {
        Row: {
          created_at: string | null
          created_by: string | null
          default_duration_mins: number | null
          exercise_type: string
          format: string
          id: string
          is_active: boolean | null
          materia: string | null
          section: string
          test_number: number
          test_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_duration_mins?: number | null
          exercise_type: string
          format: string
          id?: string
          is_active?: boolean | null
          materia?: string | null
          section: string
          test_number: number
          test_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_duration_mins?: number | null
          exercise_type?: string
          format?: string
          id?: string
          is_active?: boolean | null
          materia?: string | null
          section?: string
          test_number?: number
          test_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_question_history: {
        Row: {
          corrected_json: Json | null
          correction_notes: string | null
          created_at: string | null
          created_by: string | null
          difficulty: string
          example_usage_count: number | null
          generated_json: Json
          id: number
          prompt_used: string | null
          question_type: string
          rating: number | null
          rejection_reason: string | null
          response_time_ms: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tokens_used: number | null
          used_as_example: boolean | null
        }
        Insert: {
          corrected_json?: Json | null
          correction_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          example_usage_count?: number | null
          generated_json: Json
          id?: number
          prompt_used?: string | null
          question_type: string
          rating?: number | null
          rejection_reason?: string | null
          response_time_ms?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tokens_used?: number | null
          used_as_example?: boolean | null
        }
        Update: {
          corrected_json?: Json | null
          correction_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          example_usage_count?: number | null
          generated_json?: Json
          id?: number
          prompt_used?: string | null
          question_type?: string
          rating?: number | null
          rejection_reason?: string | null
          response_time_ms?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tokens_used?: number | null
          used_as_example?: boolean | null
        }
        Relationships: []
      }
      ordine_sections: {
        Row: {
          auth_uid: string
          id: number
          ordine: string[]
          tipologia_test: string
        }
        Insert: {
          auth_uid: string
          id?: number
          ordine: string[]
          tipologia_test: string
        }
        Update: {
          auth_uid?: string
          id?: number
          ordine?: string[]
          tipologia_test?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordine_sections_auth_uid_fkey"
            columns: ["auth_uid"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["auth_uid"]
          },
        ]
      }
      ordine_sections_global: {
        Row: {
          id: number
          ordine: string[]
          tipologia_test: string
        }
        Insert: {
          id?: number
          ordine: string[]
          tipologia_test: string
        }
        Update: {
          id?: number
          ordine?: string[]
          tipologia_test?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          argomento: string | null
          correct_answer: string
          id: string
          is_open_ended: boolean
          Materia: string | null
          page_number: number
          pdf_url: string
          pdf_url_eng: string | null
          progressivo: number | null
          question_number: number
          SAT_section: string | null
          section: string
          tipologia_esercizi: string
          tipologia_test: string | null
          wrong_answers: string[] | null
        }
        Insert: {
          argomento?: string | null
          correct_answer: string
          id?: string
          is_open_ended?: boolean
          Materia?: string | null
          page_number: number
          pdf_url: string
          pdf_url_eng?: string | null
          progressivo?: number | null
          question_number: number
          SAT_section?: string | null
          section: string
          tipologia_esercizi: string
          tipologia_test?: string | null
          wrong_answers?: string[] | null
        }
        Update: {
          argomento?: string | null
          correct_answer?: string
          id?: string
          is_open_ended?: boolean
          Materia?: string | null
          page_number?: number
          pdf_url?: string
          pdf_url_eng?: string | null
          progressivo?: number | null
          question_number?: number
          SAT_section?: string | null
          section?: string
          tipologia_esercizi?: string
          tipologia_test?: string | null
          wrong_answers?: string[] | null
        }
        Relationships: []
      }
      questions_bancaDati: {
        Row: {
          argomento: string
          correct_answer: string
          created_at: string | null
          criptato: string | null
          di_question_data: Json | null
          di_question_type: Json | null
          GMAT_question_difficulty: string | null
          GMAT_section: string | null
          id: string
          image_option_a: string | null
          image_option_b: string | null
          image_option_c: string | null
          image_option_d: string | null
          image_option_e: string | null
          image_url: string | null
          is_open_ended: boolean | null
          Materia: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          option_e: string | null
          progressivo: number | null
          question_number: number
          question_text: string
          section: string
          tipologia_esercizi: string
          tipologia_test: string | null
          wrong_1: string | null
          wrong_2: string | null
          wrong_3: string | null
          wrong_4: string | null
          wrong_answers: string[] | null
        }
        Insert: {
          argomento: string
          correct_answer: string
          created_at?: string | null
          criptato?: string | null
          di_question_data?: Json | null
          di_question_type?: Json | null
          GMAT_question_difficulty?: string | null
          GMAT_section?: string | null
          id?: string
          image_option_a?: string | null
          image_option_b?: string | null
          image_option_c?: string | null
          image_option_d?: string | null
          image_option_e?: string | null
          image_url?: string | null
          is_open_ended?: boolean | null
          Materia?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          progressivo?: number | null
          question_number: number
          question_text: string
          section: string
          tipologia_esercizi: string
          tipologia_test?: string | null
          wrong_1?: string | null
          wrong_2?: string | null
          wrong_3?: string | null
          wrong_4?: string | null
          wrong_answers?: string[] | null
        }
        Update: {
          argomento?: string
          correct_answer?: string
          created_at?: string | null
          criptato?: string | null
          di_question_data?: Json | null
          di_question_type?: Json | null
          GMAT_question_difficulty?: string | null
          GMAT_section?: string | null
          id?: string
          image_option_a?: string | null
          image_option_b?: string | null
          image_option_c?: string | null
          image_option_d?: string | null
          image_option_e?: string | null
          image_url?: string | null
          is_open_ended?: boolean | null
          Materia?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          progressivo?: number | null
          question_number?: number
          question_text?: string
          section?: string
          tipologia_esercizi?: string
          tipologia_test?: string | null
          wrong_1?: string | null
          wrong_2?: string | null
          wrong_3?: string | null
          wrong_4?: string | null
          wrong_answers?: string[] | null
        }
        Relationships: []
      }
      simulazioni_parti: {
        Row: {
          boundaries: number[] | null
          boundaries_assessment_iniziale: number[] | null
          id: number
          nome_parti: string[] | null
          time_allocation: number[] | null
          time_allocation_assessment_iniziale: number[] | null
          tipologia_test: string
        }
        Insert: {
          boundaries?: number[] | null
          boundaries_assessment_iniziale?: number[] | null
          id?: number
          nome_parti?: string[] | null
          time_allocation?: number[] | null
          time_allocation_assessment_iniziale?: number[] | null
          tipologia_test: string
        }
        Update: {
          boundaries?: number[] | null
          boundaries_assessment_iniziale?: number[] | null
          id?: number
          nome_parti?: string[] | null
          time_allocation?: number[] | null
          time_allocation_assessment_iniziale?: number[] | null
          tipologia_test?: string
        }
        Relationships: []
      }
      student_answers: {
        Row: {
          answer: string
          auth_uid: string | null
          auto_score: number | null
          id: string
          question_id: string | null
          submitted_at: string | null
          test_id: string | null
        }
        Insert: {
          answer: string
          auth_uid?: string | null
          auto_score?: number | null
          id?: string
          question_id?: string | null
          submitted_at?: string | null
          test_id?: string | null
        }
        Update: {
          answer?: string
          auth_uid?: string | null
          auto_score?: number | null
          id?: string
          question_id?: string | null
          submitted_at?: string | null
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_tests"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "student_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_answers_backup: {
        Row: {
          answer: string | null
          auth_uid: string | null
          auto_score: number | null
          id: string | null
          question_id: string | null
          submitted_at: string | null
          test_id: string | null
        }
        Insert: {
          answer?: string | null
          auth_uid?: string | null
          auto_score?: number | null
          id?: string | null
          question_id?: string | null
          submitted_at?: string | null
          test_id?: string | null
        }
        Update: {
          answer?: string | null
          auth_uid?: string | null
          auto_score?: number | null
          id?: string | null
          question_id?: string | null
          submitted_at?: string | null
          test_id?: string | null
        }
        Relationships: []
      }
      student_tests: {
        Row: {
          auth_uid: string | null
          completed_at: string | null
          duration: number | null
          format: string | null
          id: string
          progressivo: number | null
          score: number | null
          section: string
          start_time: string | null
          status: string | null
          tipologia_esercizi: string
          tipologia_test: string | null
          tutor_unlocked: boolean | null
          unlock_mode: string
          unlock_order: number
        }
        Insert: {
          auth_uid?: string | null
          completed_at?: string | null
          duration?: number | null
          format?: string | null
          id?: string
          progressivo?: number | null
          score?: number | null
          section: string
          start_time?: string | null
          status?: string | null
          tipologia_esercizi: string
          tipologia_test?: string | null
          tutor_unlocked?: boolean | null
          unlock_mode?: string
          unlock_order?: number
        }
        Update: {
          auth_uid?: string | null
          completed_at?: string | null
          duration?: number | null
          format?: string | null
          id?: string
          progressivo?: number | null
          score?: number | null
          section?: string
          start_time?: string | null
          status?: string | null
          tipologia_esercizi?: string
          tipologia_test?: string | null
          tutor_unlocked?: boolean | null
          unlock_mode?: string
          unlock_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_student"
            columns: ["auth_uid"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["auth_uid"]
          },
        ]
      }
      studentbocconi_answers: {
        Row: {
          answer: string
          auth_uid: string | null
          auto_score: number | null
          id: number
          question_id: string | null
          submitted_at: string | null
          test_id: string | null
          tutor_score: number | null
        }
        Insert: {
          answer: string
          auth_uid?: string | null
          auto_score?: number | null
          id?: number
          question_id?: string | null
          submitted_at?: string | null
          test_id?: string | null
          tutor_score?: number | null
        }
        Update: {
          answer?: string
          auth_uid?: string | null
          auto_score?: number | null
          id?: number
          question_id?: string | null
          submitted_at?: string | null
          test_id?: string | null
          tutor_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_tests_bocconi"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "student_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studentbocconi_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_bancaDati"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          auth_uid: string | null
          created_at: string | null
          email: string
          esigenze_speciali: boolean | null
          id: string
          name: string
          password_set: boolean | null
          tests: string[] | null
          tutor_id: string | null
        }
        Insert: {
          auth_uid?: string | null
          created_at?: string | null
          email: string
          esigenze_speciali?: boolean | null
          id?: string
          name: string
          password_set?: boolean | null
          tests?: string[] | null
          tutor_id?: string | null
        }
        Update: {
          auth_uid?: string | null
          created_at?: string | null
          email?: string
          esigenze_speciali?: boolean | null
          id?: string
          name?: string
          password_set?: boolean | null
          tests?: string[] | null
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutors: {
        Row: {
          auth_uid: string
          email: string
          id: string
          name: string
        }
        Insert: {
          auth_uid: string
          email: string
          id?: string
          name: string
        }
        Update: {
          auth_uid?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reset_user_password: {
        Args: { new_password: string; user_auth_uid: string }
        Returns: boolean
      }
      cleanup_test_tables: { Args: never; Returns: undefined }
      create_student: {
        Args: {
          creating_tutor_id: string
          student_email: string
          student_name: string
          student_password: string
        }
        Returns: {
          auth_uid: string
          email: string
          id: string
          message: string
          name: string
          success: boolean
        }[]
      }
      current_user_has_role: { Args: { role_name: string }; Returns: boolean }
      get_duplicate_group: {
        Args: { question_id: string }
        Returns: {
          answers: Json
          duplicate_question_ids: Json
          id: string
          question_data: Json
          question_number: number
          question_type: string
          section: string
          test_id: string
        }[]
      }
      get_my_profile_id: { Args: never; Returns: string }
      get_profile_by_auth_uid: {
        Args: { user_auth_uid: string }
        Returns: {
          auth_uid: string
          created_at: string
          email: string
          esigenze_speciali: boolean
          id: string
          last_password_change: string
          must_change_password: boolean
          name: string
          platform_version: string
          roles: Json
          tests: Json
          tutor_id: string
          updated_at: string
        }[]
      }
      get_student_tests: {
        Args: { p_student_id: string; p_test_type: string }
        Returns: {
          assigned_at: string
          assignment_id: string
          completed_at: string
          duration_minutes: number
          exercise_type: string
          score: number
          section: string
          start_time: string
          status: string
          student_email: string
          student_name: string
          test_id: string
          test_name: string
          test_number: number
          test_type: string
        }[]
      }
      get_table_columns: {
        Args: { target_table: string }
        Returns: {
          column_name: string
        }[]
      }
      increment_example_usage: {
        Args: { question_id: number }
        Returns: undefined
      }
      is_tutor: { Args: never; Returns: boolean }
      update_password_changed: {
        Args: { user_auth_uid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
