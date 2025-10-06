import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import { Photo } from "../types/types";
import { styles } from "../styles";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.42; // two per row, with spacing

interface SortablePhotosProps {
  photos: Photo[];
  setPhotos: (updated: Photo[]) => void;
}

export const SortablePhotos: React.FC<SortablePhotosProps> = ({
  photos,
  setPhotos,
}) => {
  const positions = useRef<Animated.ValueXY[]>([]).current;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (photos.length > positions.length) {
      for (let i = positions.length; i < photos.length; i++) {
        positions[i] = new Animated.ValueXY({ x: 0, y: 0 });
      }
    } else if (photos.length < positions.length) {
      positions.splice(photos.length);
    }
  }, [photos]);

  const movePhoto = (from: number, to: number) => {
    if (from === to) return;
    const updated = [...photos];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPhotos(updated);
  };

  const getIndexFromGesture = (dy: number, dx: number, from: number) => {
    // Estimate how many "slots" we moved vertically or horizontally
    const rowLength = 2;
    const rowHeight = IMAGE_SIZE + 15;
    const colWidth = IMAGE_SIZE + 15;

    const moveY = Math.round(dy / rowHeight);
    const moveX = Math.round(dx / colWidth);
    const newIndex = from + moveX + moveY * rowLength;

    return Math.max(0, Math.min(photos.length - 1, newIndex));
  };

  const responders = photos.map((_, index) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActiveIndex(index);
        Animated.spring(positions[index], {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (evt, gesture) => {
        const pos = positions[index];
        if (!pos) return;
        pos.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const pos = positions[index];
        if (!pos) return;

        const newIndex = getIndexFromGesture(gesture.dy, gesture.dx, index);
        if (newIndex !== index) movePhoto(index, newIndex);

        Animated.spring(pos, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 50,
          useNativeDriver: false,
        }).start(() => setActiveIndex(null));
      },
    })
  );

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[styles.label, { marginBottom: 5 }]}>
        Photos (drag to reorder)
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {photos.map((photo, index) => {
          const pos = positions[index] || new Animated.ValueXY({ x: 0, y: 0 });
          const isActive = activeIndex === index;

          return (
            <Animated.View
              key={ photo.id || index}
              style={{
                transform: pos.getTranslateTransform(),
                marginBottom: 15,
                opacity: isActive ? 0.8 : 1,
                zIndex: isActive ? 2 : 1,
                elevation: isActive ? 3 : 0,
                shadowColor: "#000",
                shadowOpacity: isActive ? 0.3 : 0,
                shadowRadius: 5,
              }}
              {...(responders[index] ? responders[index].panHandlers : {})}
            >
              <Animated.View
                style={{
                  transform: [{ scale: isActive ? 1.05 : 1 }],
                }}
              >
                <Image
                  source={{ uri: photo.url }}
                  style={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    borderRadius: 10,
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    color: "green",
                    textAlign: "center",
                    marginTop: 5,
                  }}
                >
                  #{index + 1}
                </Text>
              </Animated.View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};
