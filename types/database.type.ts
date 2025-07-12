import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
  created_at: string;
}

export interface completedHabits extends Models.Document {
  user_id: string;
  created_at: string;
  habit_id: string;
}
