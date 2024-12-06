import axios from "axios";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const Spell = ({ gameVersion, spellKeys }) => {
  const [spellsData, setSpellsData] = useState();
  useEffect(() => {
    const fetchSpellsData = async () => {
      const spellsResponse = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/data/ko_KR/summoner.json`
      );
      setSpellsData(spellsResponse.data.data);
    };
    fetchSpellsData();
  }, []);

  const findSpellName = (obj, key) => {
    const spell = Object.values(obj).find(
      (spell) => spell.key === String(key).toString()
    );
    return spell.id;
  };

  if (spellKeys && spellsData) {
    return (
      <View style={styles.container}>
        {spellKeys.map((spellKey) => {
          return (
            <Image
              style={styles.spellIcon}
              source={{
                uri: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/spell/${findSpellName(
                  spellsData,
                  spellKey
                )}.png`,
              }}
            />
          );
        })}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  spellIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
});

export default Spell;
