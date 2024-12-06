import { StatusBar } from "expo-status-bar";
import Fontisto from "@expo/vector-icons/Fontisto";
import AntDesign from "@expo/vector-icons/AntDesign";
import axios from "axios";
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router/build";
import NavBar from "../components/NavBar";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [region, setRegion] = useState("asia");
  const [userInfoList, setUserInfoList] = useState([]);
  const [gameVersion, setGameVersion] = useState("13.21.1");
  // const midnightToday = new Date().setHours(0, 0, 0, 0);
  const [startTime, setStartTime] = useState(new Date());

  const router = useRouter();

  const tierIcons = {
    IRON: require("../assets/Ranked-Emblems/IRON.png"),
    BRONZE: require("../assets/Ranked-Emblems/BRONZE.png"),
    SILVER: require("../assets/Ranked-Emblems/SILVER.png"),
    GOLD: require("../assets/Ranked-Emblems/GOLD.png"),
    PLATINUM: require("../assets/Ranked-Emblems/PLATINUM.png"),
    EMERALD: require("../assets/Ranked-Emblems/EMERALD.png"),
    DIAMOND: require("../assets/Ranked-Emblems/DIAMOND.png"),
    MASTER: require("../assets/Ranked-Emblems/MASTER.png"),
    GRANDMASTER: require("../assets/Ranked-Emblems/GRANDMASTER.png"),
    CHALLENGER: require("../assets/Ranked-Emblems/CHALLENGER.png"),
  };

  // 게임 최신 버전 로드
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

  const handleSearch = async () => {
    if (!searchValue) return;

    let gameName = "";
    let tagLine = "";
    if (!searchValue.includes("#")) {
      gameName = searchValue.replace(/\s+/g, "");
      tagLine = "kr1";
    } else {
      gameName = searchValue.split("#")[0].replace(/\s+/g, "");
      tagLine = searchValue.split("#")[1];
    }

    if (userInfoList.length < 5) {
      try {
        const accountRequestURL = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          gameName
        )}/${encodeURIComponent(tagLine)}?api_key=${
          process.env.EXPO_PUBLIC_RIOT_API_KEY
        }`;

        const accountResponse = await axios.get(accountRequestURL);

        const summonerRequestURL = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountResponse.data.puuid}?api_key=${process.env.EXPO_PUBLIC_RIOT_API_KEY}`;
        const summonerResponse = await axios.get(summonerRequestURL);

        const entriesRequsetURL = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerResponse.data.id}?api_key=${process.env.EXPO_PUBLIC_RIOT_API_KEY}`;
        const entriesResponse = await axios.get(entriesRequsetURL);

        const queueTypeMap = {
          RANKED_FLEX_SR: "자유랭크",
          RANKED_SOLO_5x5: "솔로랭크",
        };

        const userData = {
          ...accountResponse.data,
          ...summonerResponse.data,
          queueType: {
            type: queueTypeMap[entriesResponse.data[0].queueType],
            tier: entriesResponse.data[0].tier,
            rank: entriesResponse.data[0].rank,
            leaguePoints: entriesResponse.data[0].leaguePoints,
            wins: entriesResponse.data[0].wins,
            losses: entriesResponse.data[0].losses,
          },
        };

        setUserInfoList((prev) => {
          const isDup = prev.some(
            (data) => data.accountId === userData.accountId
          );
          if (isDup) {
            Alert.alert("이미 등록한 유저입니다");
            return prev;
          } else {
            return [...prev, userData];
          }
        });

        setSearchValue("");
      } catch (error) {
        console.log(error.response.data);
        Alert.alert("유저를 찾을 수 없습니다");
      }
    } else {
      Alert.alert("최대 5명까지만 등록 가능합니다");
    }
  };

  const handleDeleteUser = (info) => {
    setUserInfoList((prev) =>
      prev.filter((userInfo) => userInfo.accountId !== info.accountId)
    );
  };

  const handleCheckRecord = async () => {
    const allUserMatchList = [];
    for (let userInfo of userInfoList) {
      const puuid = userInfo.puuid;
      const matchResponse = await axios.get(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${process.env.EXPO_PUBLIC_RIOT_API_KEY}`
      );
      allUserMatchList.push(matchResponse.data);
    }

    const togetherMatchList = allUserMatchList[0].filter((item) =>
      allUserMatchList.every((arr) => arr.includes(item))
    );
    router.push({
      pathname: "/records",
      params: {
        togetherMatchList: JSON.stringify(togetherMatchList),
        region,
        userList: JSON.stringify(userInfoList),
        startTime: parseInt(startTime.getTime() / 1000),
      },
    });
  };

  const handleDate = (event, date) => {
    date.setHours(0, 0, 0, 0);
    setStartTime(date);
    console.log(parseInt(date.getTime() / 1000));
    const now = new Date();
    console.log("지금:", parseInt(now.getTime() / 1000));
  };

  // useEffect(() => {
  //   console.log(userInfoList);
  // }, [userInfoList]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1, paddingTop: 70 }}>
        <NavBar routerName={"/"} />
        <View style={styles.container}>
          <View style={styles.search}>
            <View style={{ flexGrow: 1 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="유저명 + #해시태그"
                returnKeyType="search"
                onChangeText={(payload) => setSearchValue(payload)}
                onSubmitEditing={handleSearch}
                value={searchValue}
              />
              <TouchableOpacity
                onPress={() => {
                  setSearchValue((prev) => prev + "#");
                }}
                style={styles.hastagBtn}
              >
                <Fontisto name="hashtag" size={14} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                <Fontisto name="search" size={18} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {userInfoList.length > 0 ? (
            userInfoList.map((userInfo) => {
              return (
                <View
                  key={userInfo.gameName + userInfo.tagLine}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 10,
                  }}
                >
                  <Image
                    source={{
                      uri: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${userInfo.profileIconId}.png`,
                    }}
                    style={styles.profileIcon}
                  />
                  {/* <Image
                    source={require(`./../assets/Ranked-Emblems/${userInfo.queueType?.tier}.png`)}
                  /> */}
                  <View style={{ flexGrow: 1, gap: 2 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <Text>{userInfo.gameName}</Text>
                      <Text style={{ color: "rgba(0,0,0,0.5)" }}>
                        #{userInfo.tagLine}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: "#4447e4",
                        }}
                      >
                        {userInfo.summonerLevel} Level
                      </Text>
                      <Text>[{userInfo.queueType.type}]</Text>
                      <Image
                        source={tierIcons[userInfo.queueType.tier]}
                        style={styles.tierIcon}
                      />
                      <Text style={{ color: "rgba(0,0,0,0.5)" }}>
                        {userInfo.queueType.rank}{" "}
                        {userInfo.queueType.leaguePoints}LP
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteUser(userInfo)}>
                    <AntDesign name="minuscircleo" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: "center", gap: 5 }}>
              <Text style={{ color: "#959595" }}>
                해시태그를 입력하지 않을 시, 자동으로 KR1으로 검색합니다
              </Text>
              <Text style={{ color: "#959595" }}>
                유저는 최소 2명, 최대 5명까지만 등록 가능합니다
              </Text>
              <Text style={{ color: "#959595" }}>
                전적은 최근 게임으로부터 20개의 전적만 가져옵니다
              </Text>
            </View>
          )}
          {userInfoList.length > 1 && (
            <TouchableOpacity
              style={styles.recordBtn}
              onPress={handleCheckRecord}
            >
              <Text
                style={{ color: "white", fontSize: 18, textAlign: "center" }}
              >
                전적검색
              </Text>
            </TouchableOpacity>
          )}

          <StatusBar style="auto" />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 10,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  searchInput: {
    padding: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dfdede",
  },
  searchBtn: {
    position: "absolute",
    left: 15,
    top: 14,
  },
  hastagBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#e9e9e9",
    padding: 6,
    borderRadius: 10,
  },
  priceInput: {
    width: 50,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#dfdede",
    marginHorizontal: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  tierIcon: {
    width: 25,
    height: 25,
  },
  recordBtn: {
    width: "100%",
    backgroundColor: "#4447e4",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    position: "absolute",
    bottom: 0,
  },
});
