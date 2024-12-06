import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const Item = ({ itemList, gameVersion, matchId }) => {
  return (
    <View style={styles.container}>
      {itemList &&
        itemList.map((item, idx) => {
          const isLastItem = idx === itemList.length - 1;
          return (
            <Image
              key={matchId + item + idx}
              source={{
                uri: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/item/${item}.png`,
              }}
              style={[styles.item, isLastItem && styles.lastItem]}
            />
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 1,
  },
  item: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 5,
  },
  lastItem: {
    borderRadius: 99,
  },
});

export default Item;
