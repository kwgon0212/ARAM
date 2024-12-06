import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router/build";
import axios from "axios";
import CheckBox from "expo-checkbox";
import NavBar from "../../components/NavBar";
import { StatusBar } from "expo-status-bar";
import { Picker } from "@react-native-picker/picker";

const Result = () => {
  const { togetherMatchList, region, userList, startTime } =
    useLocalSearchParams();
  const matchList = togetherMatchList ? JSON.parse(togetherMatchList) : [];
  const userInfoList = userList ? JSON.parse(userList) : [];
  const [gameInfoList, setGameInfoList] = useState([]);
  const [gameVersion, setGameVersion] = useState("13.21.1");

  const [checkedMatchList, setCheckedMatchList] = useState([]);
  const [isCheckedAll, setIsCheckedAll] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState();

  const pickerRef = useRef();

  function open() {
    pickerRef.current.focus();
  }

  function close() {
    pickerRef.current.blur();
  }

  const router = useRouter();

  useEffect(() => {
    const fetchLastestVersion = async () => {
      try {
        const response = await axios.get(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const lastestVersion = response.data[0];
        setGameVersion(lastestVersion);
      } catch (error) {
        setGameVersion("13.21.1");
      }
    };
    fetchLastestVersion();
  }, []);

  useEffect(() => {
    if (matchList.length > 0) {
      const fetchMatchData = async () => {
        const gameList = [];
        for (let match of matchList) {
          const matchData = await axios.get(
            `https://${region}.api.riotgames.com/lol/match/v5/matches/${match}?api_key=${process.env.EXPO_PUBLIC_RIOT_API_KEY}`
          );
          const gameMatchId = matchData.data.metadata.matchId;
          const gameInfo = matchData.data.info;
          const gameMode = gameInfo.gameMode;
          const gameModeMap = {
            CLASSIC: "소환사의 협곡",
            ARAM: "칼바람 나락",
            URF: "우르프",
          };
          const gameModeName = gameModeMap[gameMode] || "알 수 없는 모드";
          const gameEndTime = gameInfo.gameEndTimestamp;
          const gameTimePlayed = gameInfo.participants[0].timePlayed;

          const getTeamData = (teamId) => {
            return gameInfo.participants
              .filter((user) => user.teamId === teamId)
              .map((user) => ({
                puuid: user.puuid,
                riotIdGameName: user.riotIdGameName,
                riotIdTagline: user.riotIdTagline,
                summonerId: user.summonerId,
                champ: {
                  name: user.championName,
                  id: user.championId,
                },
                perks: user.perks,
                win: user.win,
              }));
          };

          const blueTeam = getTeamData(100);
          const redTeam = getTeamData(200);

          const infoList = {
            gameMatchId,
            gameModeName,
            gameEndTime,
            gameTimePlayed,
            blueTeam,
            redTeam,
          };
          gameList.push(infoList);
        }
        setGameInfoList(gameList);
      };
      fetchMatchData();
      setIsFetched(true);
    }
  }, []);

  useEffect(() => {
    if (isCheckedAll) {
      setCheckedMatchList(matchList);
    } else {
      setCheckedMatchList([]);
    }
  }, [isCheckedAll]);

  useEffect(() => {
    if (
      checkedMatchList.length > 0 &&
      JSON.stringify(checkedMatchList) === JSON.stringify(matchList)
    ) {
      setIsCheckedAll(true);
    } else {
      setIsCheckedAll(false);
    }
  }, [checkedMatchList]);

  const handleCheckMatch = (gameMatchId) => {
    if (checkedMatchList.includes(gameMatchId)) {
      const changeList = checkedMatchList.filter((id) => id !== gameMatchId);
      setCheckedMatchList(changeList);
    } else {
      setCheckedMatchList((prev) => [...prev, gameMatchId]);
    }
  };

  const handleCheckBox = () => {
    setIsCheckedAll((prev) => !prev);
  };

  const handleStatistics = () => {
    if (checkedMatchList.length < 1) {
      Alert.alert("전적을 선택해주세요");
      return;
    }
    router.push({
      pathname: "/result",
      params: {
        matchList: JSON.stringify(checkedMatchList),
        userList: JSON.stringify(userInfoList),
        gameVersion,
        // startTime: parseInt(startTime.getTime() / 1000),
      },
    });
  };

  return (
    <View style={{ flex: 1, paddingTop: 70 }}>
      <NavBar routerName={"/records"} />
      <View style={styles.container}>
        <TouchableOpacity
          style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          onPress={handleCheckBox}
        >
          <CheckBox
            color={"#4447e4"}
            value={isCheckedAll}
            onValueChange={setIsCheckedAll}
          />
          <Text>전체 선택</Text>
        </TouchableOpacity>
        {/* <Picker
          selectedValue={selectedLanguage}
          ref={pickerRef}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedLanguage(itemValue)
          }
        >
          <Picker.Item label="Java" value="java" />
          <Picker.Item label="JavaScript" value="js" />
        </Picker> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {isFetched ? (
            gameInfoList.length === 0 ? (
              <Text>전적을 불러오는 중입니다...</Text>
            ) : (
              gameInfoList.map((gameInfo) => {
                const end = new Date(gameInfo.gameEndTime);
                const endYear = end.getFullYear();
                const endMonth = String(end.getMonth() + 1).padStart(2, "0");
                const endDate = String(end.getDate()).padStart(2, "0");
                const endHour = String(end.getHours()).padStart(2, "0");
                const endMinute = String(end.getMinutes()).padStart(2, "0");
                const playTimeMin = String(
                  parseInt(gameInfo.gameTimePlayed / 60)
                ).padStart(2, "0");
                const playTimeSec = String(
                  gameInfo.gameTimePlayed % 60
                ).padStart(2, "0");
                return (
                  <TouchableOpacity
                    key={gameInfo.gameMatchId}
                    activeOpacity={0.8}
                    // style={styles.gameMatch}
                    style={{
                      backgroundColor: "#fff",
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      gap: 10,
                      borderWidth: 1,
                      borderColor: checkedMatchList.includes(
                        gameInfo.gameMatchId
                      )
                        ? "#4447e4"
                        : "#e5e5e5",
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                    onPress={() => handleCheckMatch(gameInfo.gameMatchId)}
                  >
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {gameInfo.gameModeName}
                      </Text>
                      <Text style={{ color: "rgba(0,0,0,0.5)" }}>
                        {endYear}-{endMonth}-{endDate} {endHour}:{endMinute}
                      </Text>
                    </View>
                    <Text style={{ color: "#797979" }}>
                      {playTimeMin}:{playTimeSec} 소요
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "stretch",
                        gap: 3,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          gap: 5,
                          backgroundColor: gameInfo.redTeam[0].win
                            ? "#27344e"
                            : "#59343b",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#e5e5e5",
                        }}
                      >
                        <Text
                          style={{
                            backgroundColor: "white",
                            textAlign: "center",
                            paddingVertical: 5,
                          }}
                        >
                          레드팀 ({gameInfo.redTeam[0].win ? "WIN" : "LOSE"})
                        </Text>
                        {gameInfo.redTeam.map((user) => {
                          return (
                            <View
                              key={user.riotIdGameName + user.riotIdTagline}
                              style={{
                                flexDirection: "row",
                                gap: 3,
                                paddingHorizontal: 10,
                                paddingVertical: 1,
                                alignItems: "center",
                              }}
                            >
                              <Image
                                source={{
                                  uri: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${user.champ.name}.png`,
                                }}
                                style={styles.champIcon}
                              />
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ color: "white" }}
                              >
                                {user.riotIdGameName}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <View
                        style={{
                          flex: 1,
                          gap: 5,
                          backgroundColor: gameInfo.blueTeam[0].win
                            ? "#27344e"
                            : "#59343b",
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#e5e5e5",
                        }}
                      >
                        <Text
                          style={{
                            backgroundColor: "white",
                            textAlign: "center",
                            paddingVertical: 5,
                          }}
                        >
                          블루팀 ({gameInfo.blueTeam[0].win ? "WIN" : "LOSE"})
                        </Text>
                        {gameInfo.blueTeam.map((user) => {
                          return (
                            <View
                              key={user.riotIdGameName + user.riotIdTagline}
                              style={{
                                flexDirection: "row",
                                gap: 3,
                                paddingHorizontal: 10,
                                paddingVertical: 1,
                                alignItems: "center",
                              }}
                            >
                              <Image
                                source={{
                                  uri: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${user.champ.name}.png`,
                                }}
                                style={styles.champIcon}
                              />
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ color: "white" }}
                              >
                                {user.riotIdGameName}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          ) : (
            <Text>같이한 전적이 존재하지 않습니다</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.statistics} onPress={handleStatistics}>
          <Text style={{ color: "white", fontSize: 18 }}>
            {checkedMatchList.length}/{gameInfoList.length} 통계보기
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
    position: "relative",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: "80%",
    borderRadius: 15,
    gap: 10,
  },
  //   gameMatch: {
  //     backgroundColor: "#f3f3f3",
  //     padding: 10,
  //     borderRadius: 10,
  //     marginBottom: 10,
  //     gap: 10,
  //   },
  champIcon: {
    width: 20,
    height: 20,
    borderRadius: 20,
  },
  statistics: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4447e4",
    padding: 20,
    borderRadius: 15,
  },
});

export default Result;
