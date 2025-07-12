import { DATABASE_ID, db, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  MD3Theme,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { z } from "zod";

const FREQUENCY = ["daily", "weekly", "monthly"];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
});
type formType = z.infer<typeof formSchema>;

const AddHabitScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { user } = useAuth();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<formType>({
    defaultValues: {
      title: "",
      description: "",
      frequency: "daily",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: formType) => {
    console.log("Form data: ", data);
    if (!user) return;

    try {
      await db.createDocument(DATABASE_ID, HABITS_COLLECTION_ID, ID.unique(), {
        user_id: user.$id,
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        streak_count: 0,
        last_completed: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      setValue("title", "");
      setValue("description", "");
      setValue("frequency", "daily");
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError("root", { type: "manual", message: error.message });
      }
      console.log(error);
      setError("root", { message: "Something went wrong on the server!" });
    }
  };

  return (
    <View style={styles.container}>
      {errors.root && (
        <Text style={styles.errorText}>{errors.root?.message}</Text>
      )}
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Title"
            mode="outlined"
            style={styles.input}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.title && (
        <Text style={styles.errorText}>{errors.title?.message}</Text>
      )}

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Description"
            mode="outlined"
            style={styles.input}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.description && (
        <Text style={styles.errorText}>{errors.description?.message}</Text>
      )}

      <View style={styles.segmentedButtonsContainer}>
        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={FREQUENCY.map((each) => ({
                value: each,
                label: each.charAt(0).toUpperCase() + each.slice(1),
              }))}
              style={styles.segmentedButtons}
            />
          )}
        />
        {errors.frequency && (
          <Text style={styles.errorText}>{errors.frequency?.message}</Text>
        )}
      </View>

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        Add Habit
      </Button>
    </View>
  );
};

export default AddHabitScreen;

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
    input: { marginTop: 16 },
    segmentedButtonsContainer: { marginTop: 24 },
    segmentedButtons: { backgroundColor: "#fff" },
    button: { marginTop: 40 },
    errorText: {
      color: theme.colors.error,
    },
  });
