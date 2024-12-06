import axios from "axios";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const Perks = ({ gameVersion, perks }) => {
  const [perksData, setPerksData] = useState();

  useEffect(() => {
    const fetchPerksData = async () => {
      const perksResponse = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/data/ko_KR/runesReforged.json`
      );
      setPerksData(perksResponse.data);
    };
    fetchPerksData();
  }, []);

  const findIconPath = (arr, perkId, type, runeId = null) => {
    const perk = arr.find((perk) => perk.id === perkId);
    if (type === "perk") {
      return perk.icon;
    }

    if (type === "rune") {
      const runes = perk.slots[0].runes.find((rune) => rune.id === runeId);
      return runes.icon;
    }
  };

  if (perksData) {
    return (
      <View style={styles.container}>
        <Image
          style={styles.runeIcon}
          source={{
            uri: `https://ddragon.leagueoflegends.com/cdn/img/${findIconPath(
              perksData,
              perks[0].style,
              "rune",
              perks[0].selections[0].perk
            )}`,
          }}
        />
        <Image
          style={styles.perkIcon}
          source={{
            uri: `https://ddragon.leagueoflegends.com/cdn/img/${findIconPath(
              perksData,
              perks[1].style,
              "perk"
            )}`,
          }}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    gap: 5,
    alignItems: "center",
  },
  runeIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#454545",
    borderRadius: 99,
  },
  perkIcon: {
    width: 20,
    height: 20,
    padding: 2.5,
  },
});

export default Perks;
