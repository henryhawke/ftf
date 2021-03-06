import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';
import TruckReviewItem from '../dropIns/TruckReviewItem';
import InfoWindow from '../dropIns/InfoWindow';
import SubmitOverlay from '../dropIns/SubmitOverlay';

export default function TruckReviews({ navigation }) {
  const [currentTruckReviews, setCurrentTruckReviews] = useState([]);
  const [currentTruckReviewers, setCurrentTruckReviewers] = useState([]);
  const { currentTruck } = navigation.state.params.params;
  const { onReviews } = navigation.state.params.params;
  const { id } = currentTruck;
  const [isVisible, setIsVisible] = useState(false);

  const { colors } = useTheme();

  const toggleOverlay = () => {
    setIsVisible(!isVisible);
  };

  const getTruckReviews = async() => {
    axios
      .get(`${process.env.EXPO_LocalLan}/truck/review/${id}`)
      .then((response) => {
        setCurrentTruckReviews(response.data);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getTruckReviews();
  }, []);

  useEffect(() => {
    const getTruckReviewers = async() => {
      currentTruckReviews
        .map((review: object) => review.id_user)
        .forEach((reviewerId: string) => {
          axios
            .get(`${process.env.EXPO_LocalLan}/user/${reviewerId}`)
            .then((response) => {
              if (response.data) {
                setCurrentTruckReviewers(response.data);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        });
    };
    getTruckReviewers();
  }, [currentTruckReviews]);

  const pressHandler = () => {
    navigation.navigate('TruckDetails', {
      params: {
        currentTruck, id, navigation, onDetails: true,
      },
    });
  };

  const pressHandlerPost = () => {
    navigation.navigate('TruckPosts', {
      params: {
        currentTruck, id, navigation, onPost: true, onDetails: true,
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: colors.backgroundCard,
    },
    reviews: {
      paddingTop: 0,
      marginTop: -4,
      marginBottom: -10,
      flex: 0.2,
      flexGrow: 10,
      marginHorizontal: -12.5,
    },
    modal: {
      flex: 0.1,
      flexGrow: 1.4,
    },
    infoWindow: {
      flex: 0.2,
      flexGrow: 10,
    },
    infoWindowShell: {
      marginTop: -5,
      flex: 4,
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'column',
    },
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonsContainer: {
      flex: 1.4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: -20,
      marginTop: 0,
      marginBottom: 0,
    },
    buttonContainer: {
      flex: 1,
      paddingHorizontal: 1,
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
            buttonStyle={{
              backgroundColor: colors.pressedButton,
            }}
            onPress={() => {}}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Details"
            onPress={pressHandler}
            titleStyle={styles.topButtonsTitle}
            buttonStyle={styles.topButtons}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Posts"
            onPress={pressHandlerPost}
            titleStyle={styles.topButtonsTitle}
            buttonStyle={styles.topButtons}
          />
        </View>
      </View>
      <View style={styles.infoWindowShell}>
        <InfoWindow
          currentTruck={currentTruck}
          navigation={navigation}
          onReviews={onReviews}
          style={styles.infoWindow}
          onDetails
        />
      </View>
      <View style={styles.reviews}>
        <ScrollView>
          {currentTruckReviews.map((review) => (
            <TruckReviewItem
              currentTruck={currentTruck}
              currentTruckReviewers={currentTruckReviewers}
              review={review}
              key={review.id}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.modal}>
        <SubmitOverlay
          isVisible={isVisible}
          onBackdropPress={toggleOverlay}
          onReviews
          currentTruck={currentTruck}
          getTruckReviews={getTruckReviews}
        />
      </View>
    </View>
  );
}
