import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const Chart = ({
  championName,
  gameVersion,
  totalDamage,
  gameName,
  tagLine,
  isLost,
  champLevel,
  kills,
  deaths,
  assists,
  perkComponent,
  spellComponent,
}) => {
  const generateRandomColor = useMemo(() => {
    const r = Math.floor(Math.random() * 128) + 128; // 128~255
    const g = Math.floor(Math.random() * 128) + 128; // 128~255
    const b = Math.floor(Math.random() * 128) + 128; // 128~255
    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const randomColor = generateRandomColor;
  const kda = ((kills + assists) / deaths).toFixed(2);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Text
          style={{
            color: isLost ? "#4447e4" : "black",
            fontWeight: isLost ? "bold" : null,
          }}
        >
          {gameName} #{tagLine}
        </Text>
        {isLost && (
          <Image source={require("../assets/lost.png")} style={styles.lost} />
        )}
      </View>

      <View style={styles.info}>
        <View style={{ gap: 5, flexDirection: "row" }}>
          <View style={{ position: "relative", marginRight: 5 }}>
            <Image
              source={{
                uri: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${championName}.png`,
              }}
              style={styles.champIcon}
            />
            <Text style={styles.champLevel}>{champLevel}</Text>
          </View>
          {spellComponent}
          {perkComponent}
        </View>
        <View style={styles.chart}>
          <View style={styles.kda}>
            <Text style={{ color: "green", fontWeight: "bold" }}>{kills}</Text>
            <Text>/</Text>
            <Text style={{ color: "red", fontWeight: "bold" }}>{deaths}</Text>
            <Text>/</Text>
            <Text style={{ fontWeight: "bold" }}>{assists}</Text>
            <Text style={{ marginLeft: 5, color: "#909090" }}>{kda} : 1</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <View
              style={[
                styles.bar,
                {
                  width: parseInt(totalDamage) / 450,
                  backgroundColor: randomColor,
                },
              ]}
            />
            <Text
              style={{
                fontWeight: isLost ? "bold" : null,
                color: isLost ? "#4447e4" : "black",
              }}
            >
              {totalDamage}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bar: {
    height: 20,
    borderRadius: 5,
  },
  lost: {
    width: 35,
    height: 20,
  },
  champIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  champLevel: {
    position: "absolute",
    right: -5,
    bottom: 0,
    backgroundColor: "#696969",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffffff",
    padding: 2,
    fontSize: 12,
    color: "white",
    fontWeight: 600,
  },
  kda: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  chart: {
    gap: 5,
  },
});

export default Chart;
