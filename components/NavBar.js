import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";

const NavBar = ({ routerName }) => {
  const router = useRouter();
  // const handleBack = () => {
  //     // router.back();
  //     // router.push("/");
  // };
  if (routerName === "/") {
    return (
      <View style={styles.main}>
        <Text style={styles.title}>딜량내기 계산</Text>
      </View>
    );
  } else if (routerName === "/records") {
    return (
      <View style={styles.etc}>
        <TouchableOpacity onPress={() => router.back()}>
          <Entypo name="chevron-small-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>게임 전적</Text>
      </View>
    );
  } else if (routerName === "/result") {
    return (
      <View style={styles.etc}>
        <TouchableOpacity onPress={() => router.back()}>
          <Entypo name="chevron-small-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>게임 결과</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: 50,
    position: "absolute",
    top: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 225, 225, 1)",
    justifyContent: "center",
  },
  etc: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    position: "absolute",
    top: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 225, 225, 1)",
    // backgroundColor: "rgba(245, 245, 245, 1)",
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: "center",
    gap: 5,
  },
  title: {
    textAlign: "center",
    fontWeight: 600,
    fontSize: 18,
  },
});
export default NavBar;
