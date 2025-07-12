import { useAuth } from "@/lib/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, MD3Theme, Text, TextInput, useTheme } from "react-native-paper";
import { z } from 'zod';

const formSchema = z.object({
  email : z.string().nonempty("Email Can't be empty son").min(6, 'Email must be at least 6 characters. you know better than this').email("Better use a correct email dumb ass. you ain't getting away"),
  password : z.string().min(6, 'Get yo ass a better pass. More than 6 characters').nonempty("Password can't be empty ma boi"),
  confirm: z.string().optional(),
}).refine((data) => {
  if (data.confirm !== undefined && data.confirm !== '') {
    return data.password === data.confirm;
  }
  return true;
}, {
  message: "Passwords don't match brodi",
  path: ['confirm']
})

type formInterface = z.infer<typeof formSchema>
const Auth = () => {
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const { signIn, signUp} = useAuth();

  const {handleSubmit, control, setError, formState: {errors}} = useForm<formInterface>({
    defaultValues: {
      email: '',
      password: '',
      confirm: ''
    },
    resolver : zodResolver(formSchema)
  })

  const onAuth: SubmitHandler<formInterface> = async (data: formInterface)=>{
    console.log("Form data here: ", data)
    if(isSignUp){
      const error = await signUp(data.email, data.password);
      if (error){
        setError("root", { type: "manual", message: error })
        return;
      }
      router.replace("/")
    } else{
      const error = await signIn( data.email, data.password)
      if( error){
        setError("root", { type: "manual", message: error })
        return;
      }
      router.replace("/")
    }

  }

  const handleSwitchMode= ()=>{
    setIsSignUp(prevValue=> !prevValue);
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">{isSignUp ? 'Sign Up pipaw' : 'Log yo asses up!'}</Text>
        {errors.root && <Text style={styles.errorText}>{errors.root?.message}</Text>}
        <Controller
        control={control}
        name="email"
        render={({field: {onChange, onBlur, value}})=>(
          <TextInput
            label="Email"
            keyboardType="email-address"
            mode="outlined"
            placeholder="example@gmail.com"
            autoCapitalize="none"
            onChangeText={onChange}
            value={value}
            onBlur={onBlur}
          />

        )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email?.message}</Text>}
        <Controller
        control={control}
        name="password"
        render={({field: {onBlur, onChange, value}})=>(
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            onBlur={onBlur}
            value={value}
            onChangeText={onChange}
          />
        )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password?.message}</Text>}
        {isSignUp && (
          <>
            <Controller control={control} name="confirm" render={({field : {onBlur, onChange, value}})=> (
              <TextInput
                label="Confirm Password"
                keyboardType="email-address"
                mode="outlined"
                autoCapitalize="none"
                style={styles.input}
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}/>
            {errors.confirm && <Text style={styles.errorText}>{errors.confirm?.message}</Text>}
          </>
        )}

        <Button mode="contained" style={styles.button} onPress={handleSubmit(onAuth)}>{isSignUp? 'Sign Up' : 'Sign In'}</Button>
        <Button mode="text" onPress={handleSwitchMode}>{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign Up"}</Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Auth;


const getStyles = (theme: MD3Theme) => StyleSheet.create({
  container : {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center'
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
  switchButton: {
    marginTop: 16,
  },
  errorText: {
    color: theme.colors.error,
  }
})