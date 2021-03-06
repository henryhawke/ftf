import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StyleSheet, View, AsyncStorage, Dimensions,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, Callout } from 'react-native-maps';
import InfoWindow from '../dropIns/InfoWindow';
import foodIcons from '../../../assets/mapIcons.js';

export default function TruckDetails({ navigation }) {
  const { currentTruck } = navigation.state.params.params;
  const onDetails = navigation.state.params.params.onDetails || false;
  const [favorite, setFavorite] = useState(false);
  const [googleUserId, setGoogleUserId] = useState(null);
  const [userId, setUserId] = useState('');
  const {
    full_name,
    blurb,
    logo,
    star_average,
    phone_number,
    food_genre,
    number_of_reviews,
    open_status,
    id,
    latitude,
    longitude,
  } = currentTruck;

  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const region = {
    latitude: +latitude,
    longitude: +longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  const { colors } = useTheme();

  useEffect(() => {
    const retrieveCurrentUserId = async() => {
      try {
        let value = await AsyncStorage.getItem('userData');
        if (value !== null) {
          value = JSON.parse(value);
          setGoogleUserId(value.user.id);
        } else {
          console.log('user id not found');
        }
      } catch (error) {
        console.log(error);
      }
    };
    retrieveCurrentUserId();
  }, []);

  useEffect(() => {
    const getUserIdWithGoogleUserId = async() => {
      axios
        .get(`${process.env.EXPO_LocalLan}/user/googleId/${googleUserId}`)
        .then((response) => {
          if (response.data[0] !== undefined) {
            setUserId(response.data[0].id);
          }
        })
        .catch((err) => console.log(err));
    };
    getUserIdWithGoogleUserId();
  }, [googleUserId]);

  useEffect(() => {
    const retrieveCurrentUserFavorites = async() => {
      axios
        .get(`${process.env.EXPO_LocalLan}/user/favorites/${userId}`)
        .then((response) => {
          const { data } = response;
          const { length } = data;
          if (length) {
            if (data.id !== undefined) {
              setFavorite(data.id);
            }
          }
        })
        .catch((err) => console.log(err));
    };
    if (userId) {
      retrieveCurrentUserFavorites();
      const createUserFavorite = async() => {
        axios
          .post(
            `${process.env.EXPO_LocalLan}/user/update/favoritetruck/add/${userId}/${id}`,
          )
          .then(() => {})
          .catch((err) => {
            console.log(err);
          });
      };
      createUserFavorite();
    }
  }, [userId]);

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  useEffect(() => {
    const updateUserFavorite = async() => {
      const favoriteRemove = favorite ? 'favorite' : 'remove';
      axios
        .put(
          `${process.env.EXPO_LocalLan}/user/update/favoritetruck/${favoriteRemove}/${userId}/${id}`,
        )
        .then((response) => {
          console.log(`updateUserFavorite: ${favoriteRemove}/${userId}/${id}`);
        })
        .catch((err) => console.log(err));
    };
    if (userId) {
      updateUserFavorite();
    }
  }, [favorite]);

  const pressHandler = () => {
    navigation.navigate('TruckReviews', {
      params: {
        currentTruck,
        id,
        navigation,
        onReviews: true,
        onDetails: true,
      },
    });
  };

  const pressHandlerPost = () => {
    navigation.navigate('TruckPosts', {
      params: {
        currentTruck,
        id,
        navigation,
        onPosts: true,
        onDetails: true,
      },
    });
  };

  const styles = StyleSheet.create({
    tabOutline: {
      backgroundColor: 'lightgrey',
      borderRadius: 10,
    },
    buffer: {
    },
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: colors.backgroundCard,
    },
    map: {
      flex: 4,
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: -120,
      marginHorizontal: 2.5,
      marginBottom: 2,
    },
    innerMap: {
      ...StyleSheet.absoluteFillObject,
    },
    navigation: {
      flex: 0.5,
      alignItems: 'stretch',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    favorite: {
      width: 220,
      marginTop: 60,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    infoWindow: {
      flex: 1,
      flexGrow: 10,
    },
    customView: {
      width: 280,
      height: 140,
    },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flex: 1,
      alignItems: 'flex-end',
    },
    infoWindowShell: {
      marginTop: -20,
      flex: 4,
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'column',
    },
    title: {
      textAlign: 'center',
      marginVertical: 8,
    },
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
    },
    buttonsContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -16,
      marginBottom: 0,
    },
    buttonContainer: {
      paddingBottom: 0,
      flex: 1,
      paddingHorizontal: 1,
    },
    iconContainer: {
      backgroundColor: colors.background,
    },
    topButtons: {
      backgroundColor: colors.background,
    },
    topButtonsTitle: {
      color: 'black',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonContainer}>
          <Button
            title="Reviews"
            onPress={pressHandler}
            buttonStyle={styles.topButtons}
            titleStyle={styles.topButtonsTitle}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Details"
            buttonStyle={{
              backgroundColor: colors.pressedButton,
            }}
            onPress={() => {}}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Posts"
            onPress={pressHandlerPost}
            buttonStyle={styles.topButtons}
            titleStyle={styles.topButtonsTitle}
          />
        </View>
      </View>
      <View style={styles.infoWindowShell}>
        <InfoWindow
          currentTruck={currentTruck}
          navigation={navigation}
          onDetails={true}
          details={true}
          style={styles.infoWindow}
        />
        <View style={styles.favorite}>
          {favorite ? (
            <Icon
              name="heart"
              type="font-awesome"
              color="#f50"
              underlayColor="#BCD6F0"
              containerStyle={styles.iconContainer}
              onPress={toggleFavorite}
            />
          ) : (
            <Icon
              // raised
              name="heart"
              type="font-awesome"
              color="gray"
              underlayColor="#BCD6F0"
              containerStyle={styles.iconContainer}
              onPress={toggleFavorite}
            />
          )}
        </View>
      </View>
      <View style={styles.buffer} />
      <View style={styles.map}>
        <MapView
          style={styles.innerMap}
          initialRegion={region}
          zoomTapEnabled={false}
          showsUserLocation
          followsUserLocation={false}
        >
          <View key={id}>
            <Marker
              coordinate={{
                latitude: +latitude,
                longitude: +longitude,
              }}
              image={foodIcons[food_genre]}
            >
              <Callout style={styles.customView}>
                <View>
                  <InfoWindow
                    currentTruck={currentTruck}
                    navigation={navigation}
                    details={true}
                    onDetails={true}
                  />
                </View>
              </Callout>
            </Marker>
          </View>
        </MapView>
      </View>
    </View>
  );
}
