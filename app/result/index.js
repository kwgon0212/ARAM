import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
} from "react-native";
// import Chart from "../../components/Chart";
import Chart from "../../components/Chart.js";
import NavBar from "../../components/NavBar";
import Item from "../../components/Item";
import { StatusBar } from "expo-status-bar";
import Spell from "../../components/Spell.js";
import Perks from "../../components/Perks.js";

const Result = () => {
  const { matchList, userList, gameVersion } = useLocalSearchParams();
  const [matchResult, setMatchResult] = useState([]);
  const [modalVisble, setModalVisble] = useState(false);

  const [money, setMoney] = useState(0);
  const [moneyResult, setMoneyResult] = useState({});

  const togetherMatchList = JSON.parse(matchList);
  const userInfoList = JSON.parse(userList);

  const router = useRouter();

  const findGameDataByPuuid = (arr, puuid) => {
    return arr.find((data) => data.puuid === puuid);
  };

  const handleMoney = (text) => {
    if (!text) {
      setMoney(0);
    } else {
      setMoney(parseInt(text));
    }
  };

  useEffect(() => {
    if (togetherMatchList.length > 0) {
      const fetchMatchData = async () => {
        const totalData = [];
        for (const match of togetherMatchList) {
          const matchData = await axios.get(
            `https://asia.api.riotgames.com/lol/match/v5/matches/${match}?api_key=${process.env.EXPO_PUBLIC_RIOT_API_KEY}`
          );

          const gameInfo = matchData.data.info.participants;

          const data = await Promise.all(
            userInfoList.map(async (item) => {
              const inGameData = findGameDataByPuuid(gameInfo, item.puuid);
              const totalDamage = inGameData.totalDamageDealtToChampions;
              const championName = inGameData.championName;
              const championId = inGameData.championId;
              const gameName = inGameData.riotIdGameName;
              const tagLine = inGameData.riotIdTagline;
              const champLevel = inGameData.champLevel;
              const itemList = [
                inGameData.item0,
                inGameData.item1,
                inGameData.item2,
                inGameData.item3,
                inGameData.item4,
                inGameData.item5,
                inGameData.item6,
              ];
              const kills = inGameData.kills;
              const deaths = inGameData.deaths;
              const assists = inGameData.assists;
              const gameMode = matchData.data.info.gameMode;
              const gameModeMap = {
                CLASSIC: "소환사의 협곡",
                ARAM: "칼바람 나락",
                URF: "우르프",
              };
              const gameModeName = gameModeMap[gameMode] || "알 수 없는 모드";
              const spellKeys = [
                inGameData.summoner1Id,
                inGameData.summoner2Id,
              ];
              const perks = inGameData.perks.styles;
              const gameStartTimestamp = matchData.data.info.gameStartTimestamp;
              const startTime = new Date(gameStartTimestamp);

              return {
                matchId: match,
                puuid: item.puuid,
                totalDamage,
                championName,
                championId,
                gameModeName,
                gameName,
                tagLine,
                isLost: false,
                champLevel,
                itemList,
                spellKeys,
                kills,
                deaths,
                assists,
                perks,
                startTime: {
                  year: startTime.getFullYear(),
                  month: startTime.getMonth() + 1,
                  day: startTime.getDate(),
                  hour: startTime.getHours(),
                  min: startTime.getMinutes(),
                },
              };
            })
          );

          totalData.push(data);
        }

        const updatedMatchResult = totalData.map((round) => {
          // 해당 라운드에서 totalDamage가 가장 낮은 값 찾기
          const minTotalDamage = Math.min(
            ...round.map((data) => data.totalDamage)
          );

          // totalDamage가 가장 낮은 객체의 isLost를 true로 설정
          return round.map((data) => ({
            ...data,
            isLost: data.totalDamage === minTotalDamage, // 최소값일 경우 true
          }));
        });
        setMatchResult(updatedMatchResult);
      };
      fetchMatchData();
    }
  }, []);

  const gameLostCount = useMemo(() => {
    const countIsLost = (data) => {
      const flattenedData = data.flat();

      const result = flattenedData.reduce((acc, item) => {
        const combinedKey = `${item.gameName}#${item.tagLine}`;
        if (!acc[combinedKey]) {
          acc[combinedKey] = 0;
        }
        return acc;
      }, {});

      // Count isLost for each combined key
      flattenedData.forEach((item) => {
        const combinedKey = `${item.gameName}#${item.tagLine}`;
        if (item.isLost) {
          result[combinedKey]++;
        }
      });

      return result;
    };

    return countIsLost(matchResult);
  }, [matchResult]);

  useEffect(() => {
    const adjustValues = (obj, excludeKey, value) => {
      Object.keys(obj).forEach((key) => {
        if (key !== excludeKey) {
          obj[key] += value;
        }
      });
    };

    const setAllValuesToZero = (obj) => {
      Object.keys(obj).forEach((key) => {
        obj[key] = 0;
      });
      return obj;
    };

    const result = setAllValuesToZero({ ...gameLostCount });
    const headCount = Object.keys(result).length;
    Object.entries(gameLostCount).forEach(([gameName, lostCount]) => {
      if (lostCount > 0) {
        result[gameName] -= lostCount * money * (headCount - 1);
        adjustValues(result, gameName, lostCount * money);
      }
    });
    setMoneyResult(result);
  }, [money]);

  const handleResult = () => {
    setModalVisble(true);
  };

  const redirectHome = () => {
    router.push("/");
  };

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <NavBar routerName={"/result"} />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingVertical: 20 }}
        >
          {matchResult.length > 0 &&
            matchResult.map((round, roundIndex) => {
              return (
                <View key={roundIndex + round} style={styles.round}>
                  <View style={styles.time}>
                    <Text style={{ fontWeight: "bold", color: "white" }}>
                      {round[0].gameModeName}
                    </Text>
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {round[0].startTime.year}-{round[0].startTime.month}-
                      {round[0].startTime.day}
                    </Text>
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {String(round[0].startTime.hour).padStart(2, "0")}:
                      {String(round[0].startTime.min).padStart(2, "0")}
                    </Text>
                  </View>
                  {round.map((data, index) => (
                    <View
                      style={{
                        gap: 5,
                        borderWidth: 1,
                        borderColor: data.isLost ? "#4447e4" : "#e0e0e0",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 10,
                      }}
                      key={index}
                    >
                      <Chart
                        gameName={data.gameName}
                        championName={data.championName}
                        gameVersion={gameVersion}
                        totalDamage={data.totalDamage}
                        tagLine={data.tagLine}
                        champLevel={data.champLevel}
                        isLost={data.isLost}
                        kills={data.kills}
                        deaths={data.deaths}
                        assists={data.assists}
                        perkComponent={
                          <Perks gameVersion={gameVersion} perks={data.perks} />
                        }
                        spellComponent={
                          <Spell
                            gameVersion={gameVersion}
                            spellKeys={data.spellKeys}
                          />
                        }
                      />

                      <Item
                        gameVersion={gameVersion}
                        itemList={data.itemList}
                        matchId={data.matchId}
                      />
                    </View>
                  ))}
                </View>
              );
            })}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleResult}>
          <Text style={{ color: "white", fontSize: 18 }}>전적</Text>
        </TouchableOpacity>

        <Modal
          onRequestClose={() => setModalVisble(false)}
          animationType="fade"
          transparent={true}
          visible={modalVisble}
        >
          <Pressable
            onPress={() => setModalVisble(false)}
            style={styles.modalContainer}
          >
            <Pressable onPress={() => {}} style={styles.modal}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>전적</Text>
              <View
                style={{
                  gap: 5,
                  borderBottomWidth: 1,
                  borderBottomColor: "#dadada",
                  paddingBottom: 20,
                }}
              >
                {Object.entries(gameLostCount).map(([gameName, lostCount]) => {
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                      key={gameName + lostCount}
                    >
                      <Text style={{ flex: 1 }}>{gameName}</Text>
                      <Text
                        style={{
                          color: lostCount > 0 ? "red" : "green",
                          fontWeight: lostCount > 0 ? "bold" : null,
                        }}
                      >
                        {lostCount}패
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    padding: 5,
                    borderRadius: 5,
                    backgroundColor: "#4447e4",
                    color: "white",
                  }}
                >
                  조건
                </Text>
                <Text>꼴찌가 전원에게 한 판당</Text>
                <TextInput
                  value={money.toString()}
                  onChangeText={handleMoney}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text>원씩 지급</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    padding: 5,
                    borderRadius: 5,
                    backgroundColor: "#4447e4",
                    color: "white",
                  }}
                >
                  결과
                </Text>
                <View style={{ flex: 1, gap: 5 }}>
                  {Object.entries(moneyResult).map(([gameName, value]) => {
                    return (
                      <View
                        key={gameName + value}
                        style={{ flexDirection: "row" }}
                      >
                        <Text style={{ flex: 1 }}>{gameName}</Text>
                        <Text
                          style={{
                            color:
                              value > 0 ? "green" : value < 0 ? "red" : null,
                            fontWeight: value != 0 ? "bold" : null,
                          }}
                        >
                          {value > 0 && "+"}
                          {value}원
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={redirectHome}>
                <Text style={{ color: "white", fontSize: 18 }}>홈으로</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  champIcon: {
    width: 20,
    height: 20,
    borderRadius: 20,
  },
  time: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: "#4447e4",
    padding: 10,
    borderRadius: 5,
    alignItems: "flex-end",
  },
  round: {
    gap: 5,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    borderRadius: 15,
    gap: 15,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4447e4",
    padding: 20,
    borderRadius: 15,
  },
  input: {
    width: 60,
    borderBottomWidth: 1,
  },
});

export default Result;
