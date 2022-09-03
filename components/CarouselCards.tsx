import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View } from "react-native"
import Carousel, { Pagination } from 'react-native-snap-carousel'

import { SearchString } from './CardView';
import { getTopStores } from '../api/twine';

const CarouselCards = ({data, renderItem, sliderWidth, itemWidth }) => {
  //const navigation = useRef(props.navigation);
  //const renderItem = useCallback(props.renderItem,[]);
  const isCarousel = useRef(null);
  const [index, setIndex] = useState(0);
 
  return (
    <View>
      <Carousel
        layout="default"
        layoutCardOffset={9}
        ref={isCarousel}
        data={data}
        renderItem={renderItem}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        inactiveSlideShift={0}
        useScrollView={true}
        onSnapToItem={(index) => setIndex(index)}
      />
      {/*
      <Pagination
  dotsLength={favorites.length}
  activeDotIndex={index}
  carouselRef={isCarousel}
  dotStyle={{
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)'
  }}
  inactiveDotOpacity={0.4}
  inactiveDotScale={0.6}
  tappableDots={true}
/>
*/}
    </View>
  )
}


export default CarouselCards