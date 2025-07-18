import {
  client,
  COMPLETED_COLLECTION_ID,
  DATABASE_ID,
  db,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { completedHabits, Habit } from "@/types/database.type";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Text } from "react-native-paper";

export default function Index() {
  const { logOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const swipableRef = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const completedChannel = `databases.${DATABASE_ID}.collections.${COMPLETED_COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completedSubscription = client.subscribe(
        completedChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletedHabits();
          }
        }
      );
      fetchHabits();
      fetchCompletedHabits();
      return () => {
        habitsSubscription();
        completedSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await db.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      console.log("response: ", response);
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchCompletedHabits = async () => {
    try {
      const currentDay = new Date();
      currentDay.setHours(0, 0, 0, 0);
      const response = await db.listDocuments(
        DATABASE_ID,
        COMPLETED_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", currentDay.toISOString()),
        ]
      );
      const doneHabits = response.documents as completedHabits[];
      console.log("Completed Habits: ", doneHabits);
      setCompletedHabits(doneHabits.map((each) => each.habit_id));
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const renderRightAction = (id: string) => (
    <View
      style={{
        backgroundColor: "#4caf50",
        justifyContent: "center",
        alignItems: "flex-end",
        flex: 1,
        borderRadius: 3,
        marginBottom: 10,
        paddingRight: 5,
      }}
    >
      {isCompleted(id) ? (
        <Text style={{ color: "white", marginRight: 5 }}>Completed</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color="#fff"
        />
      )}
    </View>
  );

  const handleCompleted = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    const currentDate = new Date().toISOString();
    try {
      await db.createDocument(
        DATABASE_ID,
        COMPLETED_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );

      const habit = habits.find((each) => each.$id === id);
      if (!habit) return;

      await db.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderLeftActions = () => (
    <View
      style={{
        backgroundColor: "#e53935",
        justifyContent: "center",
        alignItems: "flex-start",
        flex: 1,
        borderRadius: 3,
        marginBottom: 10,
        paddingLeft: 5,
      }}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={32} color="#fff" />
    </View>
  );

  const handleDelete = async (id: string) => {
    try {
      await db.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, id);
    } catch (error) {
      console.log(error);
    }
  };

  const isCompleted = (id: string) => completedHabits?.includes(id);
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingRight: 5,
        }}
      >
        <Text variant="headlineLarge">Today&apos;s Habits</Text>
        <Button onPress={logOut} mode="text" icon={"logout"}>
          Log out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View>
            <Text>No habit available for today</Text>
          </View>
        ) : (
          habits?.map((habit, index) => (
            <Swipeable
              key={habit.$id || index}
              ref={(ref) => {
                if (ref) {
                  swipableRef.current[habit.$id || index.toString()] = ref;
                }
              }}
              overshootLeft={false}
              overshootRight={false}
              renderRightActions={() => renderRightAction(habit.$id)}
              renderLeftActions={renderLeftActions}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDelete(habit.$id);
                } else if (direction === "right") {
                  handleCompleted(habit.$id);
                }

                swipableRef.current[habit?.$id]?.close();
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  marginBottom: 10,
                  display: "flex",
                  gap: 2,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                  elevation: 1,
                  shadowColor: "#000",
                  shadowRadius: 2,
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 1 },
                  borderRadius: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    variant="titleMedium"
                    style={{ fontWeight: "semibold", marginBottom: 2 }}
                  >
                    {habit.title}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 6,
                      borderRadius: 5,
                      backgroundColor: "#f3effa",
                    }}
                  >
                    <Text>{habit.frequency}</Text>
                  </View>
                </View>
                <Text
                  variant="bodyMedium"
                  style={{ marginBottom: 4, opacity: 0.7 }}
                >
                  {habit.description}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={18}
                    color="#ff9800"
                  />
                  <Text variant="bodySmall">
                    {habit.streak_count} day streak,
                  </Text>
                  {isCompleted(habit.$id) ? (
                    <Text variant="bodySmall" style={{ color: "#4caf50" }}>
                      Completed
                    </Text>
                  ) : (
                    <Text variant="bodySmall" style={{ color: "#e53935" }}>
                      incomplete
                    </Text>
                  )}
                </View>
              </View>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
